import React, { useCallback, memo, useMemo } from "react";
import { useMarketData } from "@ledgerhq/live-common/market/MarketDataProvider";
import styled, { DefaultTheme, StyledComponent } from "styled-components";
import { Flex, Text, Icon } from "@ledgerhq/react-ui";
import { TFunction, Trans, useTranslation } from "react-i18next";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import MarketRowItem from "./MarketRowItem";
import LoadingPlaceholder from "../../components/LoadingPlaceholder";
import { Button } from ".";
import { useSelector, useDispatch } from "react-redux";
import { localeSelector } from "~/renderer/reducers/settings";
import { addStarredMarketCoins, removeStarredMarketCoins } from "~/renderer/actions/settings";
import { useProviders } from "../exchange/Swap2/Form";
import Track from "~/renderer/analytics/Track";
import { useRampCatalog } from "@ledgerhq/live-common/platform/providers/RampCatalogProvider/index";
import { getAllSupportedCryptoCurrencyTickers } from "@ledgerhq/live-common/platform/providers/RampCatalogProvider/helpers";
import Image from "~/renderer/components/Image";
import NoResultsFound from "~/renderer/images/no-results-found.png";
import { useFeature } from "@ledgerhq/live-common/featureFlags/index";
import { FlexProps } from "styled-system";
import { CurrencyData, MarketListRequestParams } from "@ledgerhq/live-common/market/types";
import TrackPage from "~/renderer/analytics/TrackPage";

export const TableCellBase: StyledComponent<"div", DefaultTheme, FlexProps> = styled(Flex).attrs({
  alignItems: "center",
})<{ disabled?: boolean }>`
  padding-left: 5px;
  padding-right: 5px;
  cursor: ${p => (p.disabled ? "default" : "pointer")};
`;

export const TableCell = ({
  loading,
  children,
  ...props
}: {
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
} & React.ComponentProps<typeof TableCellBase>) => (
  <TableCellBase {...props}>
    {loading ? <LoadingPlaceholder style={{ borderRadius: 50, overflow: "hidden" }} /> : children}
  </TableCellBase>
);

const ChevronContainer = styled(Flex).attrs({ m: 1 })<{
  show: boolean;
  orderDirection?: string | undefined;
}>`
  opacity: ${p => (p.show ? 1 : 0)};
  svg {
    transform: rotate(
      ${p => (p.orderDirection ? (p.orderDirection === "asc" ? "180deg" : "0deg") : "90deg")}
    );
    transition: transform 0.3s ease-out;
  }
`;

export const miniChartThreshold = 900;
export const miniMarketCapThreshold = 1100;

export const SortTableCell = ({
  onClick,
  orderByKey,
  orderBy,
  order,
  children,
  ...props
}: {
  loading?: boolean;
  onClick?: (key: string) => void;
  orderByKey: string;
  orderBy?: string | undefined;
  order?: string | undefined;
  children?: React.ReactNode;
}) => (
  <TableCellBase onClick={() => !!onClick && onClick(orderByKey)} {...props}>
    {children}
    <ChevronContainer m={2} show={orderBy === orderByKey} orderDirection={order}>
      <Icon name="ChevronBottom" size={10} />
    </ChevronContainer>
  </TableCellBase>
);

const listItemHeight = 73;

export const TableRow: StyledComponent<
  "div",
  DefaultTheme,
  FlexProps & { header?: boolean; disabled?: boolean }
> = styled(Flex).attrs({
  flexDirection: "row",
  alignItems: "stretch",
  justifyContent: "flex-start",
  height: listItemHeight,
  py: 3,
})<{ header?: boolean; disabled?: boolean }>`
  line-height: 16px;
  ${p =>
    p.header
      ? `
    color: ${p.theme.colors.neutral.c80};
    font-size: 12px;
    padding-right: 12px;
  `
      : `
    color: ${p.theme.colors.neutral.c100};
    font-size: 13px;
    border-bottom: 1px solid ${p.theme.colors.neutral.c40};

    :hover {
      background:  ${p.theme.colors.neutral.c20};
    }
    :active {
      background: ${p.theme.colors.neutral.c30};
    }
  `}

  cursor: ${p => (p.disabled ? "default" : "pointer")};



  ${TableCellBase}:nth-child(1) {
    flex: 0 0 40px;
    justify-content: flex-start;
    padding-left: 5px;
  }
  ${TableCellBase}:nth-child(2) {
    flex: 1 0 230px;
    justify-content: flex-start;
  }
  ${TableCellBase}:nth-child(3) {
    flex: 1 0 80px;
    justify-content: flex-end;
  }
  ${TableCellBase}:nth-child(4) {
    flex: 1 0 30px;
    justify-content: flex-end;
  }
  ${TableCellBase}:nth-child(5) {
    flex: 1 0 90px;
    justify-content: flex-end;
  }
  ${TableCellBase}:nth-child(6) {
    flex: 1 0 70px;
    justify-content: flex-end;
  }

  ${TableCellBase}:nth-child(7) {
    flex: 0 0 40px;
    justify-content: flex-end;
    padding-right: 5px;
    svg {
      fill: currentColor;
    }
  }

  @media (max-width: ${miniChartThreshold}px) {
    ${TableCellBase}:nth-child(6) {
      display: none;
    }
  }

  @media (max-width: ${miniMarketCapThreshold}px) {
    ${TableCellBase}:nth-child(3) {
      flex: inherit;
    }
    ${TableCellBase}:nth-child(1), ${TableCellBase}:nth-child(5) {
      display: none;
    }
  }
`;

const NoCryptoPlaceholder = ({
  requestParams,
  t,
  resetSearch,
}: {
  requestParams: MarketListRequestParams;
  t: TFunction;
  resetSearch: () => void;
}) => (
  <Flex
    mt={7}
    mx={"auto"}
    justifyContent="center"
    alignItems="stretch"
    width="400px"
    flexDirection="column"
  >
    <Track event="Page Market Search" success={false} />
    <Flex justifyContent="center" alignItems="center">
      <Image alt="no result found" resource={NoResultsFound} width={192} height={192} />
    </Flex>
    <Text variant="large" my={3} textAlign="center">
      {t("market.warnings.noCryptosFound")}
    </Text>
    <Text variant="paragraph" textAlign="center">
      <Trans
        i18nKey={
          requestParams.search
            ? "market.warnings.noSearchResultsFor"
            : "market.warnings.noSearchResults"
        }
        values={{ search: requestParams.search }}
      >
        <b />
      </Trans>
    </Text>
    <Button mt={3} variant="main" onClick={resetSearch} big width="100%">
      {t("market.goBack")}
    </Button>
  </Flex>
);

const CurrencyRow = memo(function CurrencyRowItem({
  data,
  index,
  counterCurrency,
  loading,
  toggleStar,
  selectCurrency,
  starredMarketCoins,
  locale,
  swapAvailableIds,
  onRampAvailableTickers,
  style,
}: {
  data: CurrencyData[];
  index: number;
  counterCurrency?: string;
  loading: boolean;
  toggleStar: (id: string, isStarred: boolean) => void;
  selectCurrency: (currencyId: string) => void;
  starredMarketCoins: string[];
  locale: string;
  swapAvailableIds: string[];
  onRampAvailableTickers: string[];
  range?: string;
  style: React.CSSProperties;
}) {
  const currency = data ? data[index] : null;
  const internalCurrency = currency ? currency.internalCurrency : null;
  const isStarred = currency && starredMarketCoins.includes(currency.id);
  const availableOnBuy = currency && onRampAvailableTickers.includes(currency.ticker.toUpperCase());
  const availableOnSwap = internalCurrency && swapAvailableIds.includes(internalCurrency.id);
  const stakeProgramsFeatureFlag = useFeature("stakePrograms");
  const listFlag = stakeProgramsFeatureFlag?.params?.list ?? [];
  const stakeProgramsEnabled = stakeProgramsFeatureFlag?.enabled ?? false;
  const availableOnStake =
    stakeProgramsEnabled && listFlag.includes(currency?.internalCurrency?.id || "");

  return (
    <MarketRowItem
      loading={!currency || (index === data.length && index > 50 && loading)}
      currency={currency}
      counterCurrency={counterCurrency}
      isStarred={!!isStarred}
      toggleStar={() => currency?.id && toggleStar(currency.id, !!isStarred)}
      key={index}
      locale={locale}
      selectCurrency={selectCurrency}
      availableOnBuy={!!availableOnBuy}
      availableOnSwap={!!availableOnSwap}
      availableOnStake={availableOnStake}
      style={{ ...style }}
    />
  );
});

function MarketList({
  starredMarketCoins,
  toggleStarredAccounts,
}: {
  starredMarketCoins: string[];
  toggleStarredAccounts: () => void;
}) {
  const { t } = useTranslation();
  const locale = useSelector(localeSelector);
  const { providers, storedProviders } = useProviders();
  const rampCatalog = useRampCatalog();

  const onRampAvailableTickers = useMemo(() => {
    if (!rampCatalog.value) {
      return [];
    }
    return getAllSupportedCryptoCurrencyTickers(rampCatalog.value.onRamp);
  }, [rampCatalog.value]);

  const swapAvailableIds =
    providers || storedProviders
      ? (providers || storedProviders)!
          .map(({ pairs }) => pairs.map(({ from, to }) => [from, to]))
          .flat(2)
      : [];

  const {
    marketData = [],
    loading,
    endOfList,
    requestParams,
    refresh,
    loadNextPage,
    counterCurrency,
    selectCurrency,
  } = useMarketData();
  const dispatch = useDispatch();

  const { orderBy, order, starred, search, range } = requestParams;
  const currenciesLength = marketData.length;
  const freshLoading = loading && !currenciesLength;

  const resetSearch = useCallback(() => refresh({ search: "" }), [refresh]);

  const toggleStar = useCallback(
    (id, isStarred) => {
      if (isStarred) {
        dispatch(removeStarredMarketCoins(id));
      } else {
        dispatch(addStarredMarketCoins(id));
      }
    },
    [dispatch],
  );

  const toggleSortBy = useCallback(
    newOrderBy => {
      const isFreshSort = newOrderBy !== orderBy;
      refresh(
        isFreshSort
          ? { orderBy: newOrderBy, order: "desc" }
          : {
              orderBy: newOrderBy,
              order: order === "asc" ? "desc" : "asc",
            },
      );
    },
    [order, orderBy, refresh],
  );

  const isItemLoaded = useCallback((index: number) => !!marketData[index], [marketData]);
  const itemCount = endOfList ? currenciesLength : currenciesLength + 1;

  return (
    <Flex flex="1" flexDirection="column">
      {!currenciesLength && !loading ? (
        <NoCryptoPlaceholder requestParams={requestParams} t={t} resetSearch={resetSearch} />
      ) : (
        <>
          {search && currenciesLength > 0 && <TrackPage category="Market Search" success={true} />}
          <TableRow header>
            <SortTableCell
              data-test-id="market-sort-button"
              onClick={toggleSortBy}
              orderByKey="market_cap"
              orderBy={orderBy}
              order={order}
            >
              #
            </SortTableCell>
            <TableCell disabled>{t("market.marketList.crypto")}</TableCell>
            <TableCell disabled>{t("market.marketList.price")}</TableCell>
            <TableCell disabled>{t("market.marketList.change")}</TableCell>

            <TableCell disabled>{t("market.marketList.marketCap")}</TableCell>

            <TableCell disabled>{t("market.marketList.last7d")}</TableCell>
            <TableCell
              data-test-id="market-star-button"
              disabled={starredMarketCoins.length <= 0 && (!starred || starred.length <= 0)}
              onClick={toggleStarredAccounts}
            >
              <Icon name={starred && starred.length > 0 ? "StarSolid" : "Star"} size={18} />
            </TableCell>
          </TableRow>
          <Flex flex="1">
            <AutoSizer style={{ height: "100%", width: "100%" }}>
              {({ height }: { height: number }) =>
                freshLoading ? (
                  <List
                    height={height}
                    width="100%"
                    itemCount={Math.floor(height / listItemHeight)}
                    itemData={[]}
                    itemSize={listItemHeight}
                    style={{ overflowY: "hidden" }}
                  >
                    {props => (
                      <CurrencyRow
                        {...props}
                        counterCurrency={counterCurrency}
                        loading={loading}
                        toggleStar={toggleStar}
                        selectCurrency={selectCurrency}
                        starredMarketCoins={starredMarketCoins}
                        locale={locale}
                        swapAvailableIds={swapAvailableIds}
                        onRampAvailableTickers={onRampAvailableTickers}
                        range={range}
                      />
                    )}
                  </List>
                ) : currenciesLength ? (
                  <InfiniteLoader
                    isItemLoaded={isItemLoaded}
                    itemCount={itemCount}
                    loadMoreItems={loadNextPage}
                  >
                    {/* @ts-expect-error react-window-infinite-loader bindings are too strict here. */}
                    {({
                      onItemsRendered,
                      ref,
                    }: {
                      onItemsRendered: (_: unknown) => void;
                      ref: React.RefObject<List>;
                    }) => (
                      <List
                        height={height}
                        width="100%"
                        itemCount={itemCount}
                        onItemsRendered={onItemsRendered}
                        itemSize={listItemHeight}
                        itemData={marketData}
                        style={{ overflowX: "hidden" }}
                        ref={ref}
                        overscanCount={10}
                      >
                        {props => (
                          <CurrencyRow
                            {...props}
                            counterCurrency={counterCurrency}
                            loading={loading}
                            toggleStar={toggleStar}
                            selectCurrency={selectCurrency}
                            starredMarketCoins={starredMarketCoins}
                            locale={locale}
                            swapAvailableIds={swapAvailableIds}
                            onRampAvailableTickers={onRampAvailableTickers}
                            range={range}
                          />
                        )}
                      </List>
                    )}
                  </InfiniteLoader>
                ) : (
                  <NoCryptoPlaceholder
                    requestParams={requestParams}
                    t={t}
                    resetSearch={resetSearch}
                  />
                )
              }
            </AutoSizer>
          </Flex>
        </>
      )}
    </Flex>
  );
}

export default memo(MarketList);
