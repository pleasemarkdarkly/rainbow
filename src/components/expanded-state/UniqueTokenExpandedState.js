import withViewLayoutProps from '@hocs/with-view-layout-props';
import PropTypes from 'prop-types';
import React from 'react';
import { Linking, Share } from 'react-native';
import {
  compose,
  onlyUpdateForPropTypes,
  withHandlers,
  withProps,
} from 'recompact';
import { buildUniqueTokenName } from '../../helpers/assets';
import { withImageDimensionsCache } from '../../hoc';
import Routes from '../../screens/Routes/routesNames';
import { colors } from '../../styles';
import {
  deviceUtils,
  dimensionsPropType,
  logger,
  safeAreaInsetValues,
} from '../../utils';
import { Centered } from '../layout';
import { Pager } from '../pager';
import { UniqueTokenAttributes, UniqueTokenImage } from '../unique-token';
import FloatingPanel from './FloatingPanel';
import FloatingPanels from './FloatingPanels';
import { AssetPanel, AssetPanelAction, AssetPanelHeader } from './asset-panel';

const PagerControlsColorVariants = {
  dark: colors.dark,
  light: colors.white,
};

const UniqueTokenExpandedState = ({
  asset,
  maxImageHeight,
  onLayout,
  onPressSend,
  onPressShare,
  onPressView,
  panelColor,
  panelHeight,
  panelWidth,
  subtitle,
  title,
  navigation,
}) => {
  const PanelPages = [
    {
      component: (
        <UniqueTokenImage
          backgroundColor={asset.background}
          borderRadius={FloatingPanel.borderRadius}
          imageUrl={asset.image_preview_url}
          item={asset}
          resizeMode="contain"
        />
      ),
      name: 'UniqueTokenImage',
    },
  ];

  if (asset.traits.length) {
    PanelPages.push({
      component: <UniqueTokenAttributes {...asset} />,
      name: 'UniqueTokenAttributes',
    });
  }

  return (
    <FloatingPanels width={100}>
      {!!maxImageHeight && (
        <Centered>
          <FloatingPanel
            color={panelColor}
            height={panelHeight}
            width={panelWidth}
          >
            {/*
                TODO XXX: THIS FLOATING PANEL SHOULD HAVE HORIZONTAL PADDING
                IF THE IMAGE IS A PERFECT SQUARE
            */}
            <Pager
              controlsProps={{
                bottom: UniqueTokenAttributes.padding,
                color: colors.getTextColorForBackground(
                  panelColor,
                  PagerControlsColorVariants
                ),
              }}
              dimensions={{ height: panelHeight, width: panelWidth }}
              pages={PanelPages}
            />
          </FloatingPanel>
        </Centered>
      )}
      <AssetPanel onLayout={onLayout}>
        <AssetPanelHeader
          subtitle={subtitle}
          title={title}
          asset={asset}
          navigation={navigation}
        />
        {asset.isSendable && (
          <AssetPanelAction
            icon="send"
            label="Send to..."
            onPress={onPressSend}
          />
        )}
        <AssetPanelAction
          icon="compass"
          label="View on OpenSea"
          onPress={onPressView}
        />
        <AssetPanelAction icon="share" label="Share" onPress={onPressShare} />
      </AssetPanel>
    </FloatingPanels>
  );
};

UniqueTokenExpandedState.propTypes = {
  asset: PropTypes.object,
  containerHeight: PropTypes.number,
  containerWidth: PropTypes.number,
  imageDimensions: dimensionsPropType,
  maxImageHeight: PropTypes.number,
  onLayout: PropTypes.func.isRequired,
  onPressSend: PropTypes.func,
  onPressShare: PropTypes.func,
  onPressView: PropTypes.func,
  panelColor: PropTypes.string,
  panelHeight: PropTypes.number.isRequired,
  panelWidth: PropTypes.number.isRequired,
  subtitle: PropTypes.string,
  title: PropTypes.string,
};

const buildPanelDimensions = ({
  asset: { background },
  imageDimensions,
  maxImageHeight,
  panelWidth,
}) => {
  const panelHeight = imageDimensions
    ? (panelWidth * imageDimensions.height) / imageDimensions.width
    : panelWidth;

  const panelDimensions = { panelHeight };

  if (panelHeight > maxImageHeight) {
    panelDimensions.panelHeight = maxImageHeight;
    panelDimensions.panelWidth = background
      ? panelWidth
      : (maxImageHeight * imageDimensions.width) / imageDimensions.height;
  }

  return panelDimensions;
};

export default compose(
  withImageDimensionsCache,
  withViewLayoutProps(({ height: siblingHeight }) => {
    const { bottom, top } = safeAreaInsetValues;

    const viewportPadding = bottom ? bottom + top : top + top;
    const viewportHeight = deviceUtils.dimensions.height - viewportPadding;
    const maxImageHeight =
      viewportHeight - siblingHeight - FloatingPanels.margin;

    return { maxImageHeight };
  }),
  withProps(({ asset, imageDimensionsCache }) => ({
    imageDimensions: imageDimensionsCache[asset.image_preview_url],
    panelColor: asset.background || colors.lightestGrey,
    subtitle: asset.name
      ? `${asset.asset_contract.name} #${asset.id}`
      : asset.asset_contract.name,
    title: buildUniqueTokenName(asset),
  })),
  withProps(buildPanelDimensions),
  withHandlers({
    onPressSend: ({ navigation, asset }) => () => {
      navigation.navigate(Routes.SEND_SHEET, { asset });
    },
    onPressShare: ({ asset: { name, permalink } }) => () => {
      Share.share({
        title: `Share ${name} Info`,
        url: permalink,
      });
    },
    onPressView: ({ asset }) => () => {
      logger.sentry('UniqueTokenExpandedState press view on OpenSea', asset);
      const { permalink } = asset;
      permalink && Linking.openURL(permalink);
    },
  }),
  onlyUpdateForPropTypes
)(UniqueTokenExpandedState);
