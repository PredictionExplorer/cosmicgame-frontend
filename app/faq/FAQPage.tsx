'use client';

import Image from 'next/image';

import { MainWrapper } from '@/components/styled';
import FAQ from '@/components/common/FAQ';

const FAQPage = () => {
  return (
    <MainWrapper>
      <h2 className="text-2xl font-bold text-primary text-center mb-2">FAQ</h2>

      <div className="mt-8">
        <FAQ />

        <div className="flex items-center rounded-2xl p-5 sm:px-[120px] sm:py-5 sm:[@supports(background:paint(rounded-shape))]:border-0 sm:[@supports(background:paint(rounded-shape))]:[-webkit-mask:paint(rounded-shape)] sm:[@supports(background:paint(rounded-shape))]:bg-[linear-gradient(90deg,rgba(21,191,253,0.7)_0%,rgba(156,55,253,0.7)_70%)] sm:[@supports(background:paint(rounded-shape))]:[--border:1px] sm:[@supports(background:paint(rounded-shape))]:[--radius:16px] sm:[@supports(background:paint(rounded-shape))]:[--t:0] sm:[@supports(background:paint(rounded-shape))]:[--path:0_0,32px_0,100%_0,100%_calc(100%-32px),100%_100%,120px_100%,0_calc(100%-70px)] bg-card border border-border rounded-2xl">
          <div>
            <h2 className="text-2xl font-bold">Have a question?</h2>
            <div className="mb-4">
              <Image src="/images/divider.svg" width={93} height={3} alt="divider" />
            </div>
            <p className="text-[19px]">
              For any other questions, reach out to us on&nbsp;
              <a
                className="no-underline font-extrabold text-white"
                href="https://x.com/RandomWalkNFT"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
              &nbsp;or&nbsp;
              <a
                className="no-underline font-extrabold text-white"
                href="https://discord.gg/bGnPn96Qwt"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </a>
            </p>
          </div>
          <div className="ml-[60px]">
            <Image src="/images/question2.png" width={215} height={269} alt="questions" />
          </div>
        </div>
      </div>
    </MainWrapper>
  );
};

export default FAQPage;
