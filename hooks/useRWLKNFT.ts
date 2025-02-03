import { useState, useEffect } from "react";
import api from "../services/api";

export const useRWLKNFT = (tokenId) => {
  const [nft, setNft] = useState(null);

  useEffect(() => {
    const getNFT = async () => {
      try {
        const nft = await api.get_info(tokenId);
        const fileName = tokenId.toString().padStart(6, "0");
        const white_image = `http://69.10.55.2/images/randomwalk/${fileName}_white.png`;
        const white_image_thumb = `http://69.10.55.2/images/randomwalk/${fileName}_white_thumb.jpg`;
        const white_single_video = `http://69.10.55.2/images/randomwalk/${fileName}_white_single.mp4`;
        const white_triple_video = `http://69.10.55.2/images/randomwalk/${fileName}_white_triple.mp4`;
        const black_image = `http://69.10.55.2/images/randomwalk/${fileName}_black.png`;
        const black_image_thumb = `http://69.10.55.2/images/randomwalk/${fileName}_black_thumb.jpg`;
        const black_single_video = `http://69.10.55.2/images/randomwalk/${fileName}_black_single.mp4`;
        const black_triple_video = `http://69.10.55.2/images/randomwalk/${fileName}_black_triple.mp4`;

        setNft({
          id: parseInt(tokenId),
          name: nft.CurName,
          owner: nft.CurOwnerAddr,
          seed: nft.SeedHex,
          white_image,
          white_image_thumb,
          white_single_video,
          white_triple_video,
          black_image,
          black_image_thumb,
          black_single_video,
          black_triple_video,
        });
      } catch (err) {
        console.log(err);
      }
    };

    if (tokenId != null) {
      getNFT();
    }
  }, [tokenId]);

  return nft;
};
