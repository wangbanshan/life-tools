import { Container } from "@mantine/core";
import { AccountMenu } from "../auth/AccountMenu";

type HomeHeaderProps = {
  onLoginClick: () => void;
};

export function HomeHeader({ onLoginClick }: HomeHeaderProps) {
  return (
    <header className="site-header">
      <Container size="xl" className="header-inner">
        <a className="brand" href="/" aria-label="life-tools 首页">
          <span className="brand-mark-wrap">
            <img src="/life-tools-logo.svg" alt="" className="brand-mark" />
          </span>
          <span className="brand-text">life-tools</span>
        </a>

        <AccountMenu onLoginClick={onLoginClick} />
      </Container>
    </header>
  );
}
