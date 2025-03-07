import { Linking } from "react-native";
import { getDeviceModel } from "@ledgerhq/devices";
import {
  updateFirmwareActionArgs,
  UpdateFirmwareActionState,
} from "@ledgerhq/live-common/deviceSDK/actions/updateFirmware";
import { Device } from "@ledgerhq/live-common/hw/actions/types";
import {
  Alert,
  Button,
  Flex,
  IconBadge,
  Icons,
  Text,
  VerticalStepper,
  ItemStatus,
} from "@ledgerhq/native-ui";
import { useTheme, useNavigation, useRoute } from "@react-navigation/native";
import { Item } from "@ledgerhq/native-ui/components/Layout/List/types";
import {
  DeviceInfo,
  FirmwareUpdateContext,
  languageIds,
} from "@ledgerhq/types-live";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Observable } from "rxjs";
import { updateMainNavigatorVisibility } from "../../actions/appstate";
import {
  AllowManager,
  ConfirmFirmwareUpdate,
  FinishFirmwareUpdate,
  FirmwareUpdateDenied,
  DeviceActionError,
} from "../../components/DeviceAction/common";
import QueuedDrawer from "../../components/QueuedDrawer";
import {
  BaseComposite,
  StackNavigatorProps,
} from "../../components/RootNavigator/types/helpers";
import { ManagerNavigatorStackParamList } from "../../components/RootNavigator/types/ManagerNavigator";
import { ScreenName } from "../../const";
import {
  renderAllowLanguageInstallation,
  renderConnectYourDevice,
  renderImageCommitRequested,
  renderImageLoadRequested,
} from "../../components/DeviceAction/rendering";
import { useUpdateFirmwareAndRestoreSettings } from "./useUpdateFirmwareAndRestoreSettings";
import { urls } from "../../config/urls";

type FirmwareUpdateProps = {
  device: Device;
  deviceInfo: DeviceInfo;
  firmwareUpdateContext: FirmwareUpdateContext;
  onBackFromUpdate?: () => void;
  updateFirmwareAction?: (
    args: updateFirmwareActionArgs,
  ) => Observable<UpdateFirmwareActionState>;
};

type NavigationProps = BaseComposite<
  StackNavigatorProps<ManagerNavigatorStackParamList, ScreenName.FirmwareUpdate>
>;

type UpdateSteps = {
  prepareUpdate: Item;
  installUpdate: Item;
  restoreAppsAndSettings: Item;
};

const CloseWarning = ({
  onPressContinue,
  onPressQuit,
}: {
  onPressContinue: () => void;
  onPressQuit: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <Flex alignItems="center" justifyContent="center" px={1}>
      <IconBadge
        iconColor="warning.c100"
        iconSize={32}
        Icon={Icons.WarningSolidMedium}
      />
      <Text fontSize={24} fontWeight="semiBold" textAlign="center" mt={6}>
        {t("FirmwareUpdate.updateNotYetComplete")}
      </Text>
      <Text fontSize={14} textAlign="center" color="neutral.c80" mt={6}>
        {t("FirmwareUpdate.updateNotYetCompleteDescription")}
      </Text>
      <Button
        type="main"
        outline={false}
        onPress={onPressContinue}
        mt={8}
        alignSelf="stretch"
      >
        {t("FirmwareUpdate.continueUpdate")}
      </Button>
      <Button
        type="default"
        outline={false}
        onPress={onPressQuit}
        mt={6}
        alignSelf="stretch"
      >
        {t("FirmwareUpdate.quitUpdate")}
      </Button>
    </Flex>
  );
};

export const FirmwareUpdate = ({
  device,
  deviceInfo,
  firmwareUpdateContext,
  onBackFromUpdate,
  updateFirmwareAction,
}: FirmwareUpdateProps) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { dark } = useTheme();
  const theme: "dark" | "light" = dark ? "dark" : "light";
  const dispatch = useDispatch();

  const quitUpdate = useCallback(() => {
    if (onBackFromUpdate) onBackFromUpdate();
    navigation.goBack();
  }, [navigation, onBackFromUpdate]);

  const onOpenReleaseNotes = useCallback(() => {
    Linking.openURL(urls.fwUpdateReleaseNotes[device.modelId]);
  }, [device.modelId]);

  const deviceName = useMemo(
    () => getDeviceModel(device.modelId).productName,
    [device.modelId],
  );

  const [fullUpdateComplete, setFullUpdateComplete] = useState(false);

  const {
    updateActionState,
    updateStep,
    retryCurrentStep,
    staxFetchImageState,
    staxLoadImageState,
    installLanguageState,
    restoreAppsState,
    noOfAppsToReinstall,
    deviceLockedOrUnresponsive,
    hasReconnectErrors,
  } = useUpdateFirmwareAndRestoreSettings({
    updateFirmwareAction,
    device,
    deviceInfo,
  });

  useEffect(() => {
    if (updateStep === "completed") {
      const completeTimeout = setTimeout(
        () => setFullUpdateComplete(true),
        3000,
      );

      return () => clearTimeout(completeTimeout);
    }

    return undefined;
  });

  const restoreSteps = useMemo(() => {
    const steps = [];

    if (deviceInfo.languageId !== languageIds.english) {
      steps.push({
        status: {
          start: ItemStatus.inactive,
          appsBackup: ItemStatus.inactive,
          imageBackup: ItemStatus.inactive,
          firmwareUpdate: ItemStatus.inactive,
          languageRestore: ItemStatus.active,
          imageRestore: ItemStatus.completed,
          appsRestore: ItemStatus.completed,
          completed: ItemStatus.completed,
        }[updateStep],
        progress: installLanguageState.progress,
        title: t("FirmwareUpdate.steps.restoreSettings.restoreLanguage"),
      });
    }

    if (staxFetchImageState.hexImage) {
      steps.push({
        status: {
          start: ItemStatus.inactive,
          appsBackup: ItemStatus.inactive,
          imageBackup: ItemStatus.inactive,
          firmwareUpdate: ItemStatus.inactive,
          languageRestore: ItemStatus.inactive,
          imageRestore: ItemStatus.active,
          appsRestore: ItemStatus.completed,
          completed: ItemStatus.completed,
        }[updateStep],
        progress: staxLoadImageState.progress,
        title: t(
          "FirmwareUpdate.steps.restoreSettings.restoreLockScreenPicture",
        ),
      });
    }

    if (noOfAppsToReinstall > 0) {
      steps.push({
        status: {
          start: ItemStatus.inactive,
          appsBackup: ItemStatus.inactive,
          imageBackup: ItemStatus.inactive,
          firmwareUpdate: ItemStatus.inactive,
          languageRestore: ItemStatus.inactive,
          imageRestore: ItemStatus.inactive,
          appsRestore: ItemStatus.active,
          completed: ItemStatus.completed,
        }[updateStep],
        progress: restoreAppsState.itemProgress,
        title:
          t("FirmwareUpdate.steps.restoreSettings.installingApps") +
          ` ${
            !restoreAppsState.listedApps
              ? 0
              : restoreAppsState.installQueue !== undefined &&
                restoreAppsState.installQueue.length > 0
              ? noOfAppsToReinstall - (restoreAppsState.installQueue.length - 1)
              : noOfAppsToReinstall
          }/${noOfAppsToReinstall}`,
      });
    }

    return steps;
  }, [
    updateStep,
    installLanguageState.progress,
    t,
    staxFetchImageState.hexImage,
    staxLoadImageState.progress,
    restoreAppsState.listedApps,
    restoreAppsState.itemProgress,
    restoreAppsState.installQueue,
    noOfAppsToReinstall,
    deviceInfo.languageId,
  ]);

  const defaultSteps: UpdateSteps = useMemo(
    () => ({
      prepareUpdate: {
        status: ItemStatus.inactive,
        title: t("FirmwareUpdate.steps.prepareUpdate.titleActive"),
        renderBody: () => (
          <Text color="neutral.c80">
            {t("FirmwareUpdate.steps.prepareUpdate.description", {
              deviceName,
            })}
          </Text>
        ),
      },
      installUpdate: {
        status: ItemStatus.inactive,
        title: t("FirmwareUpdate.steps.installUpdate.titleInactive"),
        renderBody: () => (
          <Text color="neutral.c80">
            {t("FirmwareUpdate.steps.installUpdate.description", {
              deviceName,
            })}
          </Text>
        ),
      },
      restoreAppsAndSettings: {
        status: ItemStatus.inactive,
        title: t("FirmwareUpdate.steps.restoreSettings.titleInactive"),
        renderBody: () => (
          <Flex>
            <Text color="neutral.c80">
              {t("FirmwareUpdate.steps.restoreSettings.description")}
            </Text>
            {restoreSteps.length > 0 && (
              <VerticalStepper nested steps={restoreSteps} />
            )}
          </Flex>
        ),
      },
    }),
    [t, deviceName, restoreSteps],
  );

  useEffect(() => {
    dispatch(updateMainNavigatorVisibility(false));
    return () => {
      // this works because the firmware update screen has only one way out which is going back
      // and it will unmount the screen and put the visibility back on
      // if there other navigations for the firmware update in the future we might need to adapt this
      dispatch(updateMainNavigatorVisibility(true));
    };
  }, [dispatch]);

  const [isCloseWarningOpen, setIsCloseWarningOpen] = useState(false);

  const isAllowedToClose = useMemo(() => {
    const closableSteps: UpdateFirmwareActionState["step"][] = [
      "firmwareUpdateCompleted",
      "preparingUpdate",
      "installOsuDevicePermissionDenied",
    ];
    // TODO: review this with all the actions states

    return closableSteps.includes(updateActionState.step);
  }, [updateActionState.step]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => {
            if (isAllowedToClose) {
              quitUpdate();
            } else {
              setIsCloseWarningOpen(true);
            }
          }}
          Icon={Icons.CloseMedium}
        />
      ),
    });
  }, [navigation, quitUpdate, isAllowedToClose]);

  // this will depend on the steps we go through during the update
  const [totalNumberOfSteps, setTotalNumberOfSteps] = useState(2);

  const steps = useMemo(() => {
    const newSteps: UpdateSteps = {
      prepareUpdate: { ...defaultSteps.prepareUpdate },
      installUpdate: { ...defaultSteps.installUpdate },
      restoreAppsAndSettings: { ...defaultSteps.restoreAppsAndSettings },
    };

    // sets the install step as active
    const setInstallStepActive = () => {
      newSteps.prepareUpdate.status = ItemStatus.completed;
      newSteps.installUpdate.status = ItemStatus.active;
    };

    // update the progress value of the prepare step
    const updatePrepareStepProgress = () => {
      newSteps.prepareUpdate.progress = updateActionState.progress;
    };

    // update the progress value of the install step
    const updateInstallStepProgress = () => {
      newSteps.installUpdate.progress = updateActionState.progress;
    };

    // clear the progress value of the install step (infinite spinner)
    const clearInstallStepProgress = () => {
      newSteps.installUpdate.progress = undefined;
    };

    // sets the restore step as active
    const setRestoreStepActive = () => {
      newSteps.prepareUpdate.status = ItemStatus.completed;
      newSteps.installUpdate.status = ItemStatus.completed;
      newSteps.restoreAppsAndSettings.status = ItemStatus.active;
    };

    switch (updateActionState.step) {
      case "installingOsu":
        updatePrepareStepProgress();
        newSteps.prepareUpdate.status = ItemStatus.active;
        break;
      case "preparingUpdate":
      case "allowSecureChannelRequested":
        newSteps.prepareUpdate.status = ItemStatus.active;
        break;
      case "flashingBootloader":
        setInstallStepActive();
        // if we go through a bootloader flash it means there it will be 3 steps to the update
        setTotalNumberOfSteps(3);
        updateInstallStepProgress();
        newSteps.installUpdate.title =
          t("FirmwareUpdate.steps.installUpdate.titleActive") +
          ` 1/${totalNumberOfSteps}`;
        break;
      case "flashingMcu":
        setInstallStepActive();
        if (updateActionState.progress === 1) {
          // the last step of the update is always after the flashing of the MCU is completed
          clearInstallStepProgress();
          newSteps.installUpdate.title =
            t("FirmwareUpdate.steps.installUpdate.titleActive") +
            ` ${totalNumberOfSteps}/${totalNumberOfSteps}`;
        } else {
          updateInstallStepProgress();
          newSteps.installUpdate.title =
            t("FirmwareUpdate.steps.installUpdate.titleActive") +
            ` ${totalNumberOfSteps - 1}/${totalNumberOfSteps}`;
        }
        break;
      case "installOsuDevicePermissionGranted":
      case "installOsuDevicePermissionRequested":
        setInstallStepActive();
        break;
      case "firmwareUpdateCompleted":
        setRestoreStepActive();
        break;
      default:
        break;
    }

    return Object.values(newSteps);
  }, [
    defaultSteps.installUpdate,
    defaultSteps.prepareUpdate,
    defaultSteps.restoreAppsAndSettings,
    t,
    totalNumberOfSteps,
    updateActionState.progress,
    updateActionState.step,
  ]);

  const deviceInteractionDisplay = useMemo(() => {
    const error = updateActionState.error;

    // a TransportRaceCondition error is to be expected since we chain multiple
    // device actions that use different transport acquisition paradigms
    // the action should, however, retry to execute and resolve the error by itself
    // no need to present the error to the user
    if (error && error.name !== "TransportRaceCondition") {
      return (
        <DeviceActionError
          device={device}
          t={t}
          errorName={error.name}
          translationContext="FirmwareUpdate"
        >
          <Button
            type="main"
            outline={false}
            onPress={quitUpdate}
            mt={6}
            alignSelf="stretch"
          >
            {t("FirmwareUpdate.quitUpdate")}
          </Button>
        </DeviceActionError>
      );
    }

    switch (updateActionState.step) {
      case "allowSecureChannelRequested":
        return (
          <AllowManager
            device={device}
            wording={t("DeviceAction.allowSecureConnection")}
          />
        );
      case "installOsuDevicePermissionRequested":
        return (
          <ConfirmFirmwareUpdate
            device={device}
            oldFirmwareVersion={deviceInfo.seVersion ?? ""}
            newFirmwareVersion={firmwareUpdateContext.final.name}
            t={t}
          />
        );
      case "installOsuDevicePermissionDenied":
        return (
          <FirmwareUpdateDenied
            device={device}
            newFirmwareVersion={firmwareUpdateContext.final.name}
            onPressRestart={retryCurrentStep}
            onPressQuit={quitUpdate}
            t={t}
          />
        );
      case "installOsuDevicePermissionGranted":
        if (!firmwareUpdateContext.shouldFlashMCU) {
          return <FinishFirmwareUpdate device={device} t={t} />;
        }
        break;
      case "flashingMcu":
        if (updateActionState.progress === 1) {
          return <FinishFirmwareUpdate device={device} t={t} />;
        }
        break;
      default:
        break;
    }

    if (deviceLockedOrUnresponsive || hasReconnectErrors) {
      return (
        <Flex>
          {renderConnectYourDevice({
            t,
            device,
            theme,
            fullScreen: false,
          })}
          <Button
            type="main"
            outline={false}
            onPress={retryCurrentStep}
            mt={6}
            alignSelf="stretch"
          >
            {t("common.retry")}
          </Button>
          <Button type="default" outline={false} onPress={quitUpdate} mt={6}>
            {t("FirmwareUpdate.quitUpdate")}
          </Button>
        </Flex>
      );
    }

    if (staxLoadImageState.imageLoadRequested) {
      return renderImageLoadRequested({ t, device, fullScreen: false });
    }

    if (staxLoadImageState.imageCommitRequested) {
      return renderImageCommitRequested({ t, device, fullScreen: false });
    }

    if (restoreAppsState.allowManagerRequestedWording) {
      return (
        <AllowManager
          device={device}
          wording={t("DeviceAction.allowSecureConnection")}
        />
      );
    }

    if (installLanguageState.languageInstallationRequested) {
      return renderAllowLanguageInstallation({
        t,
        device,
        theme,
        fullScreen: false,
      });
    }

    return undefined;
  }, [
    updateActionState.error,
    updateActionState.step,
    updateActionState.progress,
    staxLoadImageState.imageLoadRequested,
    staxLoadImageState.imageCommitRequested,
    installLanguageState.languageInstallationRequested,
    restoreAppsState.allowManagerRequestedWording,
    device,
    t,
    theme,
    quitUpdate,
    deviceInfo.seVersion,
    firmwareUpdateContext.final.name,
    firmwareUpdateContext.shouldFlashMCU,
    retryCurrentStep,
    hasReconnectErrors,
    deviceLockedOrUnresponsive,
  ]);

  return (
    <>
      {fullUpdateComplete ? (
        <Flex flex={1} px={7}>
          <Flex flex={1} justifyContent="center" alignItems="center">
            <Flex mb={7}>
              <Icons.CircledCheckSolidMedium color="success.c80" size={100} />
            </Flex>
            <Text textAlign="center" fontSize={7} mb={3}>
              {t("FirmwareUpdate.updateDone", { deviceName })}
            </Text>
            <Text textAlign="center" fontSize={4} color="neutral.c80">
              {t("FirmwareUpdate.updateDoneDescription", {
                firmwareVersion: firmwareUpdateContext.final.name,
              })}
            </Text>
          </Flex>
          <Flex>
            <Button type="main" outline={false} onPress={quitUpdate}>
              {t("FirmwareUpdate.finishUpdateCTA")}
            </Button>
            <Button
              type="default"
              mt={5}
              mb={9}
              outline={false}
              onPress={onOpenReleaseNotes}
            >
              {t("FirmwareUpdate.viewUpdateChangelog")}
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Flex flex={1} justifyContent="space-between">
          <Flex>
            <Text variant="h4" ml={5}>
              {t("FirmwareUpdate.updateDevice", { deviceName })}
            </Text>
            <VerticalStepper steps={steps} />
          </Flex>
          <Flex mx={6} mb={8}>
            <Alert
              type="info"
              title={t("FirmwareUpdate.doNotLeaveLedgerLive")}
            />
          </Flex>
        </Flex>
      )}

      <QueuedDrawer
        isRequestingToBeOpened={Boolean(deviceInteractionDisplay)}
        noCloseButton
      >
        {deviceInteractionDisplay}
      </QueuedDrawer>
      <QueuedDrawer isRequestingToBeOpened={isCloseWarningOpen} noCloseButton>
        <CloseWarning
          onPressContinue={() => setIsCloseWarningOpen(false)}
          onPressQuit={quitUpdate}
        />
      </QueuedDrawer>
    </>
  );
};

const FirmwareUpdateScreen = () => {
  const { params } = useRoute<NavigationProps["route"]>();

  if (!params.device || !params.firmwareUpdateContext || !params.deviceInfo)
    return null;

  return (
    <Flex flex={1}>
      <FirmwareUpdate
        deviceInfo={params.deviceInfo}
        device={params.device}
        firmwareUpdateContext={params.firmwareUpdateContext}
        onBackFromUpdate={params.onBackFromUpdate}
      />
    </Flex>
  );
};

export default FirmwareUpdateScreen;
