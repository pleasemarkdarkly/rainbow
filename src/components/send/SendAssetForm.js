import React, { Fragment, useMemo } from 'react';
import { KeyboardArea } from 'react-native-keyboard-area';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components';
import { ButtonPressAnimation } from '../animations';
import { SendCoinRow } from '../coin-row';
import CollectiblesSendRow from '../coin-row/CollectiblesSendRow';
import SendSavingsCoinRow from '../coin-row/SendSavingsCoinRow';
import { Column } from '../layout';
import { Text } from '../text';
import SendAssetFormCollectible from './SendAssetFormCollectible';
import SendAssetFormToken from './SendAssetFormToken';
import { AssetTypes } from '@rainbow-me/entities';
import { useAsset, useColorForAsset, useDimensions } from '@rainbow-me/hooks';
import { padding, position } from '@rainbow-me/styles';
import ShadowStack from 'react-native-shadow-stack';

const AssetRowShadow = colors => [
  [0, 10, 30, colors.shadow, 0.12],
  [0, 5, 15, colors.shadow, 0.06],
];

const AssetRowGradient = styled(LinearGradient).attrs(
  ({ theme: { colors } }) => ({
    colors: colors.gradients.offWhite,
    end: { x: 0.5, y: 1 },
    start: { x: 0.5, y: 0 },
  })
)`
  ${position.cover};
`;

const Container = styled(Column)`
  ${position.size('100%')};
  background-color: ${({ theme: { colors } }) => colors.white};
  flex: 1;
`;

const FormContainer = styled(Column).attrs({
  align: 'end',
  justify: 'space-between',
})`
  ${({ isNft }) => (isNft ? padding(0) : padding(0, 19))};
  flex: 1;
  width: 100%;
`;

const KeyboardSizeView = styled(KeyboardArea)`
  background-color: ${({ theme: { colors } }) => colors.lighterGrey};
`;

export default function SendAssetForm({
  assetAmount,
  buttonRenderer,
  nativeAmount,
  nativeCurrency,
  onChangeAssetAmount,
  onChangeNativeAmount,
  onFocus,
  onResetAssetSelection,
  selected,
  sendMaxBalance,
  txSpeedRenderer,
  ...props
}) {
  const { isTinyPhone, width: deviceWidth } = useDimensions();

  const selectedAsset = useAsset(selected);

  const isNft = selectedAsset.type === AssetTypes.nft;
  const isSavings = selectedAsset.type === AssetTypes.compound;

  const AssetRowElement = isNft
    ? CollectiblesSendRow
    : isSavings
    ? SendSavingsCoinRow
    : SendCoinRow;

  const { colors } = useTheme();

  const address = selectedAsset?.address;
  const colorForAsset = useColorForAsset({ address });

  const noShadows = [[0, 0, 0, colors.transparent, 0]];
  const shadows = useMemo(() => AssetRowShadow(colors), [colors]);

  return (
    <Container>
      <ButtonPressAnimation onPress={onResetAssetSelection} scaleTo={0.925}>
        <ShadowStack
          alignSelf="center"
          backgroundColor={colors.white}
          borderRadius={20}
          height={SendCoinRow.selectedHeight}
          overflow={isTinyPhone ? 'visible' : 'hidden'}
          shadows={isTinyPhone ? noShadows : shadows}
          width={deviceWidth - 38}
        >
          {isTinyPhone ? null : <AssetRowGradient />}
          <AssetRowElement
            disablePressAnimation
            item={selectedAsset}
            selected
            testID="send-asset-form"
          >
            <Text
              align="center"
              color={colorForAsset || colors.dark}
              size="large"
              weight="heavy"
            >
              􀁴
            </Text>
          </AssetRowElement>
        </ShadowStack>
      </ButtonPressAnimation>
      <FormContainer isNft={isNft}>
        {isNft ? (
          <SendAssetFormCollectible
            asset={selectedAsset}
            buttonRenderer={buttonRenderer}
            txSpeedRenderer={txSpeedRenderer}
          />
        ) : (
          <Fragment>
            <SendAssetFormToken
              {...props}
              assetAmount={assetAmount}
              buttonRenderer={buttonRenderer}
              colorForAsset={colorForAsset}
              nativeAmount={nativeAmount}
              nativeCurrency={nativeCurrency}
              onChangeAssetAmount={onChangeAssetAmount}
              onChangeNativeAmount={onChangeNativeAmount}
              onFocus={onFocus}
              selected={selectedAsset}
              sendMaxBalance={sendMaxBalance}
              txSpeedRenderer={txSpeedRenderer}
            />
            {ios ? <KeyboardSizeView isOpen /> : null}
          </Fragment>
        )}
      </FormContainer>
    </Container>
  );
}
