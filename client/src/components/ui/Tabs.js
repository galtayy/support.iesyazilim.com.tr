import React, { useState } from 'react';

const Tabs = ({ 
  tabs, 
  defaultActiveTab = 0,
  onTabChange,
  orientation = 'horizontal', // horizontal, vertical
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onTabChange) {
      onTabChange(index);
    }
  };

  // Styles for horizontal tabs
  const horizontalStyles = {
    container: 'border-b border-gray-200',
    tabList: 'flex space-x-8',
    tab: (isActive) =>
      `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`,
    content: 'py-4'
  };

  // Styles for vertical tabs
  const verticalStyles = {
    container: 'flex space-x-6',
    tabList: 'flex flex-col space-y-1 w-48 shrink-0',
    tab: (isActive) =>
      `px-3 py-2 text-sm font-medium rounded-md ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`,
    content: 'flex-1'
  };

  const styles = orientation === 'vertical' ? verticalStyles : horizontalStyles;

  return (
    <div className={className}>
      <div className={styles.container}>
        {orientation === 'horizontal' ? (
          <>
            <div className="border-b border-gray-200">
              <nav className={`-mb-px ${styles.tabList}`}>
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    className={styles.tab(activeTab === index)}
                    onClick={() => handleTabClick(index)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className={styles.content}>
              {tabs[activeTab]?.content}
            </div>
          </>
        ) : (
          <>
            <nav className={styles.tabList}>
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  className={styles.tab(activeTab === index)}
                  onClick={() => handleTabClick(index)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className={styles.content}>
              {tabs[activeTab]?.content}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Tabs;