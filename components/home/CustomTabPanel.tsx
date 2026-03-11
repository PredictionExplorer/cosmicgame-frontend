/** Props for the {@link CustomTabPanel} component. */
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/** Accessible tab panel that renders children only when its index matches the active tab value. */
export function CustomTabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div className="p-6">{children}</div>}
    </div>
  );
}
