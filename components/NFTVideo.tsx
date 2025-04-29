import React from "react";
import Image from "next/image";
import { VideoCard, NFTImageWrapper } from "./styled";
import NFTImage from "./NFTImage";

// NFTVideo component that displays a thumbnail image with a play button overlay
const NFTVideo = ({
  image_thumb, // Thumbnail image URL for the NFT video
  onClick, // Click handler for the play button
}: {
  image_thumb: string;
  onClick: () => void;
}) => (
  <VideoCard>
    {/* Wrapper for the NFT image */}
    <NFTImageWrapper>
      {/* Displaying the NFT image with reduced opacity */}
      <NFTImage src={image_thumb} style={{ opacity: 0.55 }} />
    </NFTImageWrapper>

    {/* Play button overlay positioned at the center */}
    <div
      style={{
        position: "absolute", // Positioning the button in the center
        top: "50%", // Vertically center the button
        left: "50%", // Horizontally center the button
        transform: "translate(-50%, -50%)", // Adjust to truly center
        cursor: "pointer", // Change cursor to pointer on hover
      }}
    >
      {/* Play button icon */}
      <Image
        src={"/images/play.svg"} // Path to the play icon
        alt="play" // Alt text for accessibility
        onClick={onClick} // Trigger the onClick handler when clicked
        width={85} // Set the width of the play icon
        height={84} // Set the height of the play icon
      />
    </div>
  </VideoCard>
);

export default NFTVideo;
