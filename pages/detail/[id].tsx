import { GetServerSidePropsContext } from "next";
import NFTTrait from "../../components/NFTTrait";
import { MainWrapper } from "../../components/styled";
import axios from "axios";
import { cosmicGameBaseUrl } from "../../services/api";
import { getAssetsUrl } from "../../utils";

const Detail = ({ tokenId }) => {
  return (
    <MainWrapper
      maxWidth={false}
      style={{
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      <NFTTrait tokenId={tokenId} />
    </MainWrapper>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params!.id;
  const tokenId = Array.isArray(id) ? id[0] : id;
  const title = `Token #${tokenId} | Cosmic Signature Token`;
  const description = `Discover the unique attributes and ownership history of Cosmic Signature Token #${tokenId}, an exclusive digital collectible from the Cosmic Signature game.`;
  const { data } = await axios.get(cosmicGameBaseUrl + `cst/info/${tokenId}`);
  const fileName = `0x${data.TokenInfo.Seed}`;
  const imageUrl = getAssetsUrl(`cosmicsignature/${fileName}.png`);

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];
  return {
    props: { tokenId: parseInt(tokenId), title, description, openGraphData },
  };
}

export default Detail;
