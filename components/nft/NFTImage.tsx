import React from 'react';
import styled from '@emotion/styled';

const StyledImage = styled('img')`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  vertical-align: middle;
`;

interface NFTImageProps {
  src?: string;
  style?: React.CSSProperties;
  sx?: Record<string, unknown>;
}

const NFTImage = (props: NFTImageProps) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/images/qmark.png';
  };

  return (
    <StyledImage
      src={props.src || '/images/qmark.png'}
      onError={handleImageError}
      alt="nft image"
      style={props.style}
    />
  );
};

export default NFTImage;
