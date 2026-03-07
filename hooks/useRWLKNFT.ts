import { useState, useEffect } from "react";
import api from "../services/api";
import { getRWLKImageUrl } from "../utils";

export const useRWLKNFT = (tokenId) => {
  const [nft, setNft] = useState(null);

  useEffect(() => {
    const getNFT = async () => {
      try {
        const info = await api.get_info(tokenId);
        const fileName = tokenId.toString().padStart(6, "0");

        setNft({
          id: parseInt(tokenId),
          name: info?.CurName || "",
          owner: info?.CurOwnerAddr || "",
          seed: info?.SeedHex || "",
          white_image:        getRWLKImageUrl(fileName, "white.png"),
          white_image_thumb:  getRWLKImageUrl(fileName, "white_thumb.jpg"),
          white_single_video: getRWLKImageUrl(fileName, "white_single.mp4"),
          white_triple_video: getRWLKImageUrl(fileName, "white_triple.mp4"),
          black_image:        getRWLKImageUrl(fileName, "black.png"),
          black_image_thumb:  getRWLKImageUrl(fileName, "black_thumb.jpg"),
          black_single_video: getRWLKImageUrl(fileName, "black_single.mp4"),
          black_triple_video: getRWLKImageUrl(fileName, "black_triple.mp4"),
        });
      } catch (err) {
        console.error("useRWLKNFT: failed to fetch token info", err);
      }
    };

    if (tokenId != null) {
      getNFT();
    }
  }, [tokenId]);

  return nft;
};
