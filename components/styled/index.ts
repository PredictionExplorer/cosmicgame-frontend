import {
  Box,
  Link,
  AppBar,
  List,
  Chip,
  Container,
  Button,
  Accordion,
  Card,
  TextField,
  Skeleton,
  TableContainer,
  TableCell,
  TableHead,
  AccordionDetails,
  TableRow,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { isMobile, isSafari } from 'react-device-detect'

export const StyledLink = styled(Link)({
  color: '#fff',
  textDecoration: 'underline',
})

export const StyledCard = styled(Card)(!isSafari ? {
  position: "relative",
  background: "transparent",
  boxShadow: "none",
  button: {
    position: "relative",
    border: 0,
    "--border": "1px",
    "--radius": "16px",
    "--t": 0,
    "--path": "0 0px,32px 0,100% 0,100% 80%,75% 100%,0 100%",
    WebkitMask: "paint(rounded-shape)",
    background: "transparent",
    boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
    "&:before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: "linear-gradient(-27.86deg, #15BFFD 9.96%, #9C37FD 100%)",
      opacity: 0.7,
      "--t": 1,
      WebkitMask: "paint(rounded-shape)",
      pointerEvents: 'none'
    }
  }
} : {
  position: "relative",
  background: "transparent",
  boxShadow: "none",
  button: {
    border: "1px solid rgba(21, 191, 253, 0.5)",
    borderRadius: "16px",
    overflow: "hidden"
  }
})

export const StyledCard2 = styled(Card)(!isSafari ? {
  position: "relative",
  background: "transparent",
  boxShadow: "none",
  button: {
    position: "relative",
    border: 0,
    "--border": "1px",
    "--radius": "16px",
    "--t": 0,
    "--path": "0 0px,32px 0,100% 0,100% 55%,88% 100%,0 100%",
    WebkitMask: "paint(rounded-shape)",
    background: "transparent",
    boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
    "&:before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: "linear-gradient(-27.86deg, #15BFFD 9.96%, #9C37FD 100%)",
      opacity: 0.7,
      "--t": 1,
      WebkitMask: "paint(rounded-shape)"
    }
  }
} : {
  position: "relative",
  background: "transparent",
  boxShadow: "none",
  button: {
    border: "1px solid rgba(21, 191, 253, 0.5)",
    borderRadius: "16px",
    overflow: "hidden"
  }
})

export const TablePrimaryContainer = styled(TableContainer)({
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '8px 8px 0px 0px'
})

export const TablePrimaryHead = styled(TableHead)({
  backgroundColor: '#15BFFD',
})

export const TablePrimaryCell = styled(TableCell)({
  fontSize: 14,
  color: "rgba(255, 255, 255, 0.68)",
  borderBottom: 0
})

export const TablePrimaryRow = styled(TableRow)({
  border: "1px solid rgba(255, 255, 255, 0.06)"
})

export const NavLink = styled(StyledLink)({
  textTransform: 'uppercase',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
})

export const AppBarWrapper = styled(AppBar)(({ theme }) => ({
  backgroundImage: "none",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}))

export const FooterWrapper = styled(AppBar)({
  top: 'auto',
  bottom: 0,
  backgroundImage: "none",
})

export const DrawerList = styled(List)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  width: 265,
  height: '100%',
  backgroundColor: '#080B2A',
}))

export const Wallet = styled(Chip)(({ theme }) => ({
  padding: theme.spacing(1),
  height: 'auto',
  marginLeft: 'auto',
  fontSize: 16,
}))

export const MobileWallet = styled(Wallet)({
  margin: '0 auto',
})

export const ConnectButton = styled(Button)({
  marginLeft: 'auto',
})

export const MobileConnectButton = styled(ConnectButton)({
  marginRight: 'auto',
})

export const MainWrapper = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(20),
  paddingBottom: theme.spacing(24),
  overflow: 'hidden',
  lineHeight: 1,
  minHeight: 'calc(100vh - 100px)',
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(18),
    paddingBottom: theme.spacing(18),
  },
}))

export const CenterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
  },
}))

export const CounterWrapper = styled(Box)({
  display: 'flex',
  justifyContent: "space-between",
  // alignItems: 'center',
})

export const CounterItemWrapper = styled(Box)(!isSafari ? {
  position: "relative",
  width: "75px",
  padding: "6px 16px",
  margin: "0 auto 8px",
  border: 0,
  "--border": "1px",
  "--radius": "4px",
  "--t": 0,
  "--path": "0 0,8px 0,100% 0,100% calc(100% - 14px),calc(100% - 16px) 100%,0 100%",
  WebkitMask: "paint(rounded-shape)",
  background: "transparent",
  "&:before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(152.14deg, #15BFFD 9.96%, #9C37FD 100%)",
    "--t": 1,
    WebkitMask: "paint(rounded-shape)"
  }
} : {
  border: "1px solid rgba(21, 191, 253, 0.5)",
  borderRadius: "4px",
  overflow: "hidden"
})

export const CounterItem = styled(Box)({
  width: isMobile ? '80%' : '20%',
  padding: '8px 0',
  boxSizing: 'border-box',
  marginBottom: isMobile ? 24 : 0,
})

export const QuestionIcon = styled('img')({
  marginRight: '0.5rem',
})

export const FaqAccordion = styled(Accordion)({
  border: 0,
  marginBottom: "40px !important",
  padding: '12px 16px',
  position: 'relative',
  borderRadius: '8px',
  zIndex: 0,
  "& > .MuiAccordionSummary-root": {
    border: "0 !important"
  },
  '&:before': {
    display: 'none',
  },
  '&:after': {
    zIndex: -1,
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: '8px',
    padding: "1px",
    height: "100%",
    background: "linear-gradient(152.14deg, rgba(21, 191, 253, 0.49) 9.96%, rgba(156, 55, 253, 0.49) 100%)",
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    opacity: "1 !important"
  },
  '&:first-of-type': {
    borderRadius: '8px',
  },
  '&:last-of-type': {
    borderRadius: '8px',
  }
})

export const FaqAccordionDetails = styled(AccordionDetails)({
  padding: "0 40px 12px"
})

export const NFTImageWrapper = styled(Box)(!isSafari ? {
  position: "relative",
  border: 0,
  "--border": "1px",
  "--radius": "8px",
  "--t": 0,
  "--path": "0 0,16px 0,100% 0,100% calc(100% - 16px),100% 100%,0 100%",
  WebkitMask: "paint(rounded-shape)",
  background: "transparent",
  "&:before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(152.14deg, #15BFFD 9.96%, #9C37FD 100%)",
    "--t": 1,
    WebkitMask: "paint(rounded-shape)"
  }
} : {
  border: "1px solid rgba(21, 191, 253, 0.5)",
  borderRadius: "8px",
  overflow: "hidden"
})

export const NFTSkeleton = styled(Skeleton)({
  width: '100%',
  paddingTop: '64%',
})

export const NFTCheckMark = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
})

export const NFTInfoWrapper = styled('div')({
  position: 'absolute',
  top: 16,
  left: 20,
})

export const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('xs')]: {
    flexDirection: 'column',
  },
}))

export const SearchField = styled(TextField)(({ theme }) => ({
  marginRight: theme.spacing(1),
  width: 360,
  [theme.breakpoints.down('xs')]: {
    marginRight: 0,
    marginBottom: theme.spacing(2),
    width: '100%',
  },
}))

export const SearchButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    width: '100%',
  },
}))

export const VideoCard = styled(StyledCard)({
  position: 'relative',
  background: "linear-gradient(#080B2A, #080B2A) padding-box, linear-gradient(90deg, rgba(21, 191, 253, 0) 8.19%, rgba(21, 191, 253, 0.7) 70.61%, rgba(156, 55, 253, 0.7) 100%) border-box",
  borderRadius: "16px",
  border: "6px solid transparent",
  padding: "21px 16px",
})

export const SectionWrapper = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}))

export const GradientText = styled(Typography)({
  background: "linear-gradient(117.76deg, #35C9FF 3.35%, #1D9BEF 3.35%, #AC56FF 82.8%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
})

export const GradientBorder = styled(Box)(!isSafari ? {
  position: "relative",
  border: 0,
  "--border": "1px",
  "--radius": "16px",
  "--t": 0,
  "--path": "0 0,32px 0,100% 0,100% calc(100% - 32px),100% 100%,0 100%",
  WebkitMask: "paint(rounded-shape)",
  background: "transparent",
  "&:before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(152.14deg, rgba(21, 191, 253, 0.7) 9.96%, rgba(156, 55, 253, 0.7) 100%)",
    "--t": 1,
    WebkitMask: "paint(rounded-shape)"
  }
} : {
  border: "1px solid rgba(21, 191, 253, 0.5)",
  borderRadius: "16px",
  overflow: "hidden"
})

export const CodeWrapper = styled(Box)(!isSafari ? {
  position: "relative",
  border: 0,
  "--border": "1px",
  "--radius": "16px",
  "--t": 0,
  "--path": "0 0,32px 0,100% 0,100% 85%,80% 100%,0 100%",
  WebkitMask: "paint(rounded-shape)",
  background: "rgba(255, 255, 255, 0.05)",
  "&:before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(152.14deg, rgba(156, 55, 253, 0.7) 9.96%, rgba(21, 191, 253, 0.7) 100%)",
    "--t": 1,
    WebkitMask: "paint(rounded-shape)"
  }
} : {
  border: "1px solid rgba(21, 191, 253, 0.5)",
  borderRadius: "16px",
  overflow: "hidden"
})

export const CustomTextField = styled(TextField)({
  ".MuiInputBase-root": {
    padding: "2px 16px 2px 0 !important"
  },
  ".MuiInputBase-input": {
    padding: "12px 16px !important"
  }
})

export const StyledInput = styled('input')({
  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    WebkitAppearance: "inner-spin-button !important",
    width: "15px",
    position: "absolute",
    padding: "0px 6px !important",
    top: 0,
    right: 0,
    height: "100%"
  }
})

