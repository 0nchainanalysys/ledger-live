import React from "react";
import { Trans } from "react-i18next";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useCosmosFamilyPreloadData } from "@ledgerhq/live-common/families/cosmos/react";
import { getAccountUnit } from "@ledgerhq/live-common/account/index";
import { formatCurrencyUnit } from "@ledgerhq/live-common/currencies/index";
import { SyncOneAccountOnMount } from "@ledgerhq/live-common/bridge/react/index";
import TrackPage from "~/renderer/analytics/TrackPage";
import Box from "~/renderer/components/Box";
import Button from "~/renderer/components/Button";
import RetryButton from "~/renderer/components/RetryButton";
import ErrorDisplay from "~/renderer/components/ErrorDisplay";
import SuccessDisplay from "~/renderer/components/SuccessDisplay";
import BroadcastErrorDisclaimer from "~/renderer/components/BroadcastErrorDisclaimer";
import { OperationDetails } from "~/renderer/drawers/OperationDetails";
import { setDrawer } from "~/renderer/drawers/Provider";
import { StepProps } from "../types";
import { localeSelector } from "~/renderer/reducers/settings";
const Container = styled(Box).attrs(() => ({
  alignItems: "center",
  grow: true,
  color: "palette.text.shade100",
}))<{
  shouldSpace?: boolean;
}>`
  justify-content: ${p => (p.shouldSpace ? "space-between" : "center")};
`;

function StepConfirmation({ account, optimisticOperation, error, signed, transaction }: StepProps) {
  const currencyId = account.currency.id;
  const { validators } = useCosmosFamilyPreloadData(currencyId);
  const locale = useSelector(localeSelector);
  if (optimisticOperation) {
    const unit = account && getAccountUnit(account);
    const validator = transaction && transaction.validators ? transaction.validators[0] : null;
    const v =
      validator &&
      validators.find(({ validatorAddress }) => validatorAddress === validator.address);
    const amount =
      unit &&
      validator &&
      formatCurrencyUnit(unit, validator.amount, {
        showCode: true,
        locale,
      });
    const titleKey = transaction?.mode === "claimReward" ? "title" : "titleCompound";
    const textKey = transaction?.mode === "claimReward" ? "text" : "textCompound";
    return (
      <Container>
        <TrackPage category="ClaimRewards Cosmos Flow" name="Step Confirmed" />
        <SyncOneAccountOnMount
          reason="transaction-flow-confirmation"
          priority={10}
          accountId={optimisticOperation.accountId}
        />
        <SuccessDisplay
          title={
            <Trans i18nKey={`cosmos.claimRewards.flow.steps.confirmation.success.${titleKey}`} />
          }
          description={
            <div>
              <Trans
                i18nKey={`cosmos.claimRewards.flow.steps.confirmation.success.${textKey}`}
                values={{
                  amount,
                  validator: v && v.name,
                }}
              >
                <b></b>
              </Trans>
            </div>
          }
        />
      </Container>
    );
  }
  if (error) {
    return (
      <Container shouldSpace={signed}>
        <TrackPage category="ClaimRewards Cosmos Flow" name="Step Confirmation Error" />
        {signed ? (
          <BroadcastErrorDisclaimer
            title={<Trans i18nKey="cosmos.claimRewards.flow.steps.confirmation.broadcastError" />}
          />
        ) : null}
        <ErrorDisplay error={error} withExportLogs />
      </Container>
    );
  }
  return null;
}
export function StepConfirmationFooter({
  account,
  onRetry,
  error,
  onClose,
  optimisticOperation,
}: StepProps) {
  const concernedOperation = optimisticOperation
    ? optimisticOperation.subOperations && optimisticOperation.subOperations.length > 0
      ? optimisticOperation.subOperations[0]
      : optimisticOperation
    : null;
  return (
    <Box horizontal alignItems="right">
      <Button ml={2} onClick={onClose}>
        <Trans i18nKey="common.close" />
      </Button>
      {concernedOperation ? (
        // FIXME make a standalone component!
        <Button
          primary
          ml={2}
          event="ClaimRewards Cosmos Flow Step 3 View OpD Clicked"
          onClick={() => {
            onClose();
            if (account && concernedOperation) {
              setDrawer(OperationDetails, {
                operationId: concernedOperation.id,
                accountId: account.id,
              });
            }
          }}
        >
          <Trans i18nKey="cosmos.claimRewards.flow.steps.confirmation.success.cta" />
        </Button>
      ) : error ? (
        <RetryButton primary ml={2} onClick={onRetry} />
      ) : null}
    </Box>
  );
}
export default StepConfirmation;
