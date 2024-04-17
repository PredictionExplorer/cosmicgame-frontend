import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Pagination,
  TableBody,
  Typography,
} from "@mui/material";
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

const TokenRow = ({ row, stakeState, setStakeState }) => {
  const { data: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const isDisabled = (field) => {
    if (row.UnstakeEligibleTimeStamp > row.CurChainTimeStamp) {
      return true;
    }
    if (field === "unstake" && stakedActionIds.includes(row.StakeActionId)) {
      return false;
    }
    if (field === "claim" && !stakeState.unstake) {
      return true;
    }
    if (field === "restake" && !stakeState.unstake) {
      return true;
    }
  };
  const isChecked = (field) => {
    if (field === "unstake" && stakedActionIds.includes(row.StakeActionId)) {
      return false;
    }
    return false;
  };

  useEffect(() => {
    setStakeState({ ...stakeState, unstake: isChecked("unstake") });
  }, []);

  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          href={`/detail/${row.TokenId}`}
          target="_blank"
          sx={{ color: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Checkbox
          size="small"
          checked={stakeState.unstake}
          disabled={isDisabled("unstake")}
          onChange={(e) =>
            setStakeState({
              unstake: e.target.checked,
              claim: stakeState.claim && e.target.checked,
              restake: stakeState.restake && e.target.checked,
            })
          }
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Checkbox
          size="small"
          checked={stakeState.claim}
          disabled={isDisabled("claim")}
          onChange={(e) =>
            setStakeState({
              ...stakeState,
              claim: e.target.checked,
            })
          }
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Checkbox
          size="small"
          checked={stakeState.restake}
          disabled={isDisabled("restake")}
          onChange={(e) =>
            setStakeState({
              ...stakeState,
              restake: e.target.checked,
            })
          }
        />
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface stakeStateInterface {
  unstake: boolean;
  claim: boolean;
  restake: boolean;
}

const TokensTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const [stakeState, setStakeState] = useState<stakeStateInterface[]>(
    new Array(list.length).fill({
      unstake: false,
      claim: false,
      restake: false,
    })
  );

  const updateStakeState = (index, param) => {
    const newArray = [...stakeState];
    console.log(newArray, param);
    newArray[index] = param;
    setStakeState(newArray);
  };
  if (list.length === 0) {
    return <Typography>No deposits yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell />
              <TablePrimaryHeadCell>Unstake</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Claim</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Restake</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <TokenRow
                  row={row}
                  key={row.RecordId}
                  stakeState={stakeState[(page - 1) * perPage + index]}
                  setStakeState={(param) =>
                    updateStakeState((page - 1) * perPage + index, param)
                  }
                />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(_e, page) => setPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};

export default function AdvancedClaimDialog({ tokens, open, setOpen }) {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
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
        <DialogContent>
          <TokensTable list={tokens} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Send Transaction</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
