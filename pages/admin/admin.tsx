import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../../components/styled";
import { useEffect, useState } from "react";
import api from "../../services/api";

const Contracts = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const newData = await api.get_dashboard_info();
      setData(newData);
    };
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Admin | CosmicSignature NFT</title>
        <meta
          name="description"
          content="Programmatically generated CosmicSignature image and video NFTs. ETH spent on minting goes back to the minters."
        />
      </Head>
      <MainWrapper>
        <Typography variant="h4" color="primary" align="center">
          Administrative methods
        </Typography>
        {data === null ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <Box mt={6}>
              <Typography variant="h5">Cosmic Game Contract</Typography>
              <Box ml={2}>
                <Box mt={3}>
                  <Typography variant="subtitle1">
                    Cosmic Signature Token (ERC721) Contract Address
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      variant="filled"
                      color="secondary"
                      placeholder="Enter address here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.ContractAddrs.CosmicSignatureAddr}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set Address
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Cosmic Token (ERC20) Contract Address
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      variant="filled"
                      color="secondary"
                      placeholder="Enter address here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.ContractAddrs.CosmicTokenAddr}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set Address
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Charity Wallet Contract Address
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      variant="filled"
                      color="secondary"
                      placeholder="Enter address here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.ContractAddrs.CharityWalletAddr}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set Address
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    RandomWalk NFT Contract Address
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      variant="filled"
                      color="secondary"
                      placeholder="Enter address here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.ContractAddrs.RandomWalkAddr}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set Address
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Raffle Wallet Contract Address
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      variant="filled"
                      color="secondary"
                      placeholder="Enter address here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.ContractAddrs.RaffleWalletAddr}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set Address
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Staking Wallet Contract Address
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      variant="filled"
                      color="secondary"
                      placeholder="Enter address here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.ContractAddrs.StakingWalletAddr}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set Address
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Marketing Wallet Contract Address
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      variant="filled"
                      color="secondary"
                      placeholder="Enter address here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.ContractAddrs.MarketingWalletAddr}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set Address
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Business Logic Contract Address
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      variant="filled"
                      color="secondary"
                      placeholder="Enter address here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.ContractAddrs.BusinessLogicAddr}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set Address
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Number of Raffle Winners Per Round
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.NumRaffleEthWinners}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Number of Raffle NFT Winners Per Round
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.NumRaffleNFTWinners}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Number of NFT Holder Winners Per Round
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.NumHolderNFTWinners}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">Prize Percentage</Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.PrizePercentage}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Charity Percentage
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.CharityPercentage}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">Raffle Percentage</Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.RafflePercentage}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Staking Percentage
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.StakignPercentage}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">Time Increase</Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.TimeIncrease}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Timeout Claim Prize
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      // value={data?.TimeIncrease}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">Price Increase</Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.PriceIncrease}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Nano Seconds Extra
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      value={data?.NanosecondsExtra}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Initial Seconds Until Prize
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      // value={data?.NanosecondsExtra}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Initial Bid Amount Fraction
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      // value={data?.NanosecondsExtra}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">Activation Time</Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                      // value={data?.NanosecondsExtra}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    ETH To CST Bid Ratio
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">
                    Round Start CST Auction Length
                  </Typography>
                  <Box display="flex" mt={1}>
                    <TextField
                      type="number"
                      variant="filled"
                      color="secondary"
                      placeholder="Enter number here"
                      fullWidth
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography variant="subtitle1">Switch Mode</Typography>
                  <Box display="flex" mt={1}>
                    <FormControl fullWidth>
                      <Select value={"runtime"}>
                        <MenuItem value={"runtime"}>Runtime Mode</MenuItem>
                        <MenuItem value={"maintenance"}>
                          Maintenance Mode
                        </MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      color="secondary"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Set
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
            {/* <Box mt={6}>
              <Typography variant="h5">Cosmic DAO Contract</Typography>
              <Box ml={2}></Box>
            </Box>
            <Typography variant="h5">
              Cosmic Signature Token (ERC721) Contract
            </Typography>
            <Typography variant="h5">Cosmic Token (ERC20) Contract</Typography>
            <Typography variant="h5">Staking Wallet Contract</Typography>
            <Typography variant="h5">Raffle Wallet Contract</Typography>
            <Typography variant="h5">Charity Wallet Contract</Typography>
            <Typography variant="h5">Marketing Wallet Contract</Typography> */}
          </>
        )}
      </MainWrapper>
    </>
  );
};

export default Contracts;
