import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import NFTTrait from "../../components/NFTTrait";
import { MainWrapper } from "../../components/styled";

const Detail = ({ tokenId }) => {
  return (
    <>
      <Head>
        <title>NFT #{tokenId} | CosmicSignature Token</title>
      </Head>
      <MainWrapper
        maxWidth={false}
        style={{
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        <NFTTrait tokenId={tokenId} />
      </MainWrapper>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params!.id;
  const tokenId = Array.isArray(id) ? id[0] : id;
  return { props: { tokenId: parseInt(tokenId) } };
}

export default Detail;
