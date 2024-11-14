import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  TableBody,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { Tr } from "react-super-responsive-table";
import { useEffect, useState } from "react";
import { useStakedToken } from "../contexts/StakedTokenContext";
import api from "../services/api";
import { CustomPagination } from "./CustomPagination";

interface Token {
  TokenId: number;
  StakeActionId: number;
  IsRandomWalk: boolean;
  RecordId: number;
  DepositId: number;
  unstake: boolean;
  claim: boolean;
}

interface TokenRowProps {
  row: Token;
  stakeState: Token;
  setStakeState: (token: Token) => void;
  tokenName: string;
  isUnstakeDisabled: boolean;
  isClaimDisabled: boolean;
}

const TokenRow = ({
  row,
  stakeState,
  setStakeState,
  tokenName,
  isUnstakeDisabled,
  isClaimDisabled,
}: TokenRowProps) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell align="center">
        <Link
          href={
            row.IsRandomWalk
              ? `https://randomwalknft.com/detail/${row.TokenId}`
              : `/detail/${row.TokenId}`
          }
          target="_blank"
          sx={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{tokenName || " "}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {!isUnstakeDisabled ? (
          <Checkbox
            size="small"
            sx={{ p: 0 }}
            checked={stakeState.unstake}
            onChange={(e) =>
              setStakeState({
                ...stakeState,
                unstake: e.target.checked,
                claim: stakeState.claim && e.target.checked,
              })
            }
          />
        ) : (
          " "
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Checkbox
          size="small"
          sx={{ p: 0 }}
          checked={stakeState.claim}
          disabled={isClaimDisabled}
          onChange={(e) =>
            setStakeState({
              ...stakeState,
              claim: e.target.checked,
            })
          }
        />
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface TokensTableProps {
  stakeState: Token[];
  setStakeState: (tokens: Token[]) => void;
}

const TokensTable = ({ stakeState, setStakeState }: TokensTableProps) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const { cstokens: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const [isAllSelected, setAllSelected] = useState({
    unstake: true,
    claim: true,
  });
  const [tokenNames, setTokenNames] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchTokenNames = async () => {
      const names: { [key: number]: string } = {};
      await Promise.all(
        stakeState.map(async (token) => {
          if (!tokenNames[token.TokenId]) {
            if (token.IsRandomWalk) {
              const res = await api.get_info(token.TokenId);
              names[token.TokenId] = res.CurName || "";
            } else {
              const nameHistory = await api.get_name_history(token.TokenId);
              if (nameHistory.length > 0) {
                names[token.TokenId] =
                  nameHistory[nameHistory.length - 1].TokenName || "";
              } else {
                names[token.TokenId] = "";
              }
            }
          }
        })
      );
      setTokenNames((prev) => ({ ...prev, ...names }));
    };

    fetchTokenNames();
  }, [stakeState]);

  const updateStakeState = (index: number, param: Token) => {
    const newArray = [...stakeState];
    newArray[index] = param;
    setStakeState(newArray);
  };

  const handleSelectUnstakeAll = () => {
    const shouldUnstakeAll = !isAllSelected.unstake;
    const newArray = stakeState.map((x) => ({
      ...x,
      unstake: stakedActionIds.includes(x.StakeActionId) && shouldUnstakeAll,
      claim: x.claim && shouldUnstakeAll,
    }));
    setStakeState(newArray);
    setAllSelected((prev) => ({
      ...prev,
      unstake: shouldUnstakeAll,
      claim: !shouldUnstakeAll ? false : prev.claim,
    }));
  };

  const handleSelectClaimAll = () => {
    const shouldClaimAll = !isAllSelected.claim;
    const newArray = stakeState.map((x) => ({
      ...x,
      claim: shouldClaimAll && x.unstake,
    }));
    setStakeState(newArray);
    setAllSelected((prev) => ({
      ...prev,
      claim: shouldClaimAll,
    }));
  };

  const isDisabled = (type: string) => {
    if (type === "unstake") {
      return !stakeState.some((x) => stakedActionIds.includes(x.StakeActionId));
    }
    if (type === "claim") {
      return !stakeState.some((x) => x.unstake);
    }
    return false;
  };

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell>Token Id</TablePrimaryHeadCell>
              <TablePrimaryHeadCell style={{ maxWidth: "100px" }}>
                Token Name
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Unstake</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Claim</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {stakeState
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <TokenRow
                  row={row}
                  key={row.RecordId}
                  stakeState={stakeState[(page - 1) * perPage + index]}
                  setStakeState={(param) =>
                    updateStakeState((page - 1) * perPage + index, param)
                  }
                  tokenName={tokenNames[row.TokenId] || " "}
                  isUnstakeDisabled={
                    !stakedActionIds.includes(row.StakeActionId)
                  }
                  isClaimDisabled={
                    !stakeState[(page - 1) * perPage + index].unstake
                  }
                />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={stakeState.length}
        perPage={perPage}
      />
      {stakeState.length > 1 && (
        <Box mt={2}>
          <Button
            size="small"
            onClick={handleSelectUnstakeAll}
            sx={{ textTransform: "none", mr: 1 }}
            disabled={isDisabled("unstake")}
          >
            Unstake All
          </Button>
          <Button
            size="small"
            onClick={handleSelectClaimAll}
            sx={{ textTransform: "none", mr: 1 }}
            disabled={isDisabled("claim")}
          >
            Claim All
          </Button>
        </Box>
      )}
    </>
  );
};

interface AdvancedClaimDialogProps {
  stakeState: Token[];
  setStakeState: (tokens: Token[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleUnstakeClaim: (
    message: string,
    unstakeIds: number[],
    claimIds: number[],
    depositIds: number[]
  ) => void;
}

export default function AdvancedClaimDialog({
  stakeState,
  setStakeState,
  open,
  setOpen,
  handleUnstakeClaim,
}: AdvancedClaimDialogProps) {
  const { cstokens: stakedCSTTokens } = useStakedToken();
  const stakedActionIds = stakedCSTTokens.map((x) => x.TokenInfo.StakeActionId);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSendTransaction = async () => {
    handleClose();
    handleUnstakeClaim(
      "unstaked, claimed",
      stakeState
        .filter((x) => x.unstake && stakedActionIds.includes(x.StakeActionId))
        .map((x) => x.StakeActionId),
      stakeState.filter((x) => x.claim).map((x) => x.StakeActionId),
      stakeState.filter((x) => x.claim).map((x) => x.DepositId)
    );
  };

  const isSendTransactionDisabled = () => {
    const unstakeActionIds = stakeState
      .filter((x) => x.unstake && stakedActionIds.includes(x.StakeActionId))
      .map((x) => x.StakeActionId);
    const claimActionIds = stakeState
      .filter((x) => x.claim)
      .map((x) => x.StakeActionId);
    return unstakeActionIds.length === 0 && claimActionIds.length === 0;
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Advanced Transaction Build
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <TokensTable stakeState={stakeState} setStakeState={setStakeState} />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isSendTransactionDisabled()}
          onClick={handleSendTransaction}
          sx={{ textTransform: "none" }}
        >
          Send Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
}
