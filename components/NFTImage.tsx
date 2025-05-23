import React from "react";
import styled from "@emotion/styled";

const StyledImage = styled("img")`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  vertical-align: middle;
`;

const NFTImage = (props) => {
  const handleImageError = (event) => {
    event.target.src = "/images/qmark.png";
  };

  return (
    <StyledImage
      src={props.src || "/images/qmark.png"}
      onError={handleImageError}
      alt="nft image"
    />
  );
};

export default NFTImage;
