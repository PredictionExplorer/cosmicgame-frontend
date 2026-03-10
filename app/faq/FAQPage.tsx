'use client';

import Image from 'next/image';
import { Box, Paper, Typography, Link, styled } from '@mui/material';

import { MainWrapper } from '@/components/styled';
import FAQ from '@/components/common/FAQ';

/**
 * Conditionally styled Paper component.
 * On desktop (min-width: sm) and when paint worklet is supported (not Firefox),
 * we apply a custom, gradient-based background with a rounded shape mask.
 */
const StyledPaper = styled(Paper)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    '@supports (background: paint(rounded-shape))': {
      position: 'relative',
      padding: '20px 120px',
      border: 0,
      '--border': '1px',
      '--radius': '16px',
      '--t': 0,
      '--path': '0 0,32px 0,100% 0,100% calc(100% - 32px),100% 100%,120px 100%,0 calc(100% - 70px)',
      WebkitMask: 'paint(rounded-shape)',
      background: 'linear-gradient(90deg, rgba(21, 191, 253, 0.7) 0%, rgba(156, 55, 253, 0.7) 70%)',
    },
  },
}));

/**
 * FAQPage: Displays a list of frequently asked questions and
 * provides links to external resources for further queries.
 */
const FAQPage = () => {
  return (
    <MainWrapper>
      {/* Page Title */}
      <Typography variant="h4" color="primary" textAlign="center" gutterBottom>
        FAQ
      </Typography>

      <Box mt={4}>
        {/* Render the FAQ component, presumably a list of questions/answers */}
        <FAQ />

        {/* Bottom Section prompting further queries via Twitter/Discord */}
        <StyledPaper sx={{ display: 'flex', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4">Have a question?</Typography>
            <Box marginBottom="16px">
              <Image src={'/images/divider.svg'} width={93} height={3} alt="divider" />
            </Box>
            <Typography fontSize={19}>
              For any other questions, reach out to us on&nbsp;
              <Link
                style={{
                  textDecoration: 'none',
                  fontWeight: 800,
                  color: '#fff',
                }}
                href="https://x.com/RandomWalkNFT"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </Link>
              &nbsp;or&nbsp;
              <Link
                style={{
                  textDecoration: 'none',
                  fontWeight: 800,
                  color: '#fff',
                }}
                href="https://discord.gg/bGnPn96Qwt"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </Link>
            </Typography>
          </Box>
          <Box marginLeft="60px">
            <Image src={'/images/question2.png'} width={215} height={269} alt="questions" />
          </Box>
        </StyledPaper>
      </Box>
    </MainWrapper>
  );
};

export default FAQPage;
