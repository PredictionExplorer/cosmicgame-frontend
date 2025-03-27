import { GetServerSidePropsContext } from "next";
import NFTTrait from "../../components/NFTTrait";
import { MainWrapper } from "../../components/styled";
import axios from "axios";
import { cosmicGameBaseUrl } from "../../services/api";
import { getAssetsUrl } from "../../utils";

interface DetailProps {
  tokenId: number;
  title: string;
  description: string;
  openGraphData: Array<{ property?: string; name?: string; content: string }>;
}

// Detail component that renders NFTTrait inside a styled MainWrapper
const Detail = ({ tokenId }: DetailProps) => {
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

// Server-side props function to fetch token data for SSR
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Extract tokenId from URL params
  const idParam = context.params!.id;
  const tokenId = Array.isArray(idParam) ? idParam[0] : idParam;

  // Define meta information for SEO and Open Graph
  const title = `Token #${tokenId} | Cosmic Signature Token`;
  const description = `Discover the unique attributes and ownership history of Cosmic Signature Token #${tokenId}, an exclusive digital collectible from the Cosmic Signature game.`;

  // Fetch token details from API
  const { data } = await axios.get(`${cosmicGameBaseUrl}cst/info/${tokenId}`);

  // Generate image URL based on token seed
  const fileName = `0x${data.TokenInfo.Seed}`;
  const imageUrl = getAssetsUrl(`cosmicsignature/${fileName}.png`);

  // Open Graph meta data
  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  // Return props to component
  return {
    props: {
      tokenId: parseInt(tokenId, 10),
      title,
      description,
      openGraphData,
    },
  };
}

export default Detail;
