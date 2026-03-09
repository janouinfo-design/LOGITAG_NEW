import { TabView, TabPanel } from 'primereact/tabview';
import ActivitiesTab from './ActivitiesTab';

const TabsSection = ({ onChangeTab, activeTab, children }) => {
  // Convert activeTab string to index
  let activeIndex = 0;
  if (activeTab === 'activities') {
    activeIndex = 1;
  }

  // Handler to convert PrimeReact's index-based tabs to our string-based tabs
  const handleTabChange = (e) => {
    onChangeTab(e.index === 0 ? 'apercu' : 'activities');
  };

  return (
    <div className="w-full">
      <TabView 
        activeIndex={activeIndex} 
        onTabChange={handleTabChange}
        // pt={{
        //   root: { className: 'w-full' },
        //   navContainer: { 
        //     className: 'grid grid-cols-2 max-w-[300px] bg-[rgba(210,100,50,0.05)] rounded-lg p-1 border-none' 
        //   },
        //   nav: { className: 'm-0 border-none' },
        //   inkbar: { className: 'hidden' },
        //   navContent: { className: 'w-full' },
        //   panelContainer: { className: 'border-none p-0 mt-4 bg-transparent' }
        // }}
      >

          {/* <TabPanel 
            header="Chifts"
            pt={{
              header: { className: 'm-0' },
              headerAction: { 
                className: 'rounded-md transition-all duration-200 bg-transparent border-none text-[#8E9196] px-4 py-2 font-normal flex justify-center',
                style: (context) => context.active ? {
                  backgroundColor: 'white',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  color: '#2563eb',
                  fontWeight: 500
                } : {
                  ':hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    color: '#8E9196'
                  }
                }
              },
              headerTitle: { className: '' },
              content: { className: '' },
            }}
          >
            <div>Test</div>
        </TabPanel> */}
        <TabPanel 
          header="Aperçu"
          pt={{
            header: { className: 'm-0' },
            headerAction: { 
              className: 'rounded-md transition-all duration-200 bg-transparent border-none text-[#8E9196] px-4 py-2 font-normal flex justify-center',
              style: (context) => context.active ? {
                backgroundColor: 'white',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                color: '#2563eb',
                fontWeight: 500
              } : {
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  color: '#8E9196'
                }
              }
            },
            headerTitle: { className: '' },
            content: { className: '' },
          }}
        >
          {activeTab === 'apercu' && children}
        </TabPanel>
        
        <TabPanel 
          header="Activités suivies"
          pt={{
            header: { className: 'm-0' },
            headerAction: { 
              className: 'rounded-md transition-all duration-200 bg-transparent border-none text-[#8E9196] px-4 py-2 font-normal flex justify-center',
              style: (context) => context.active ? {
                backgroundColor: 'white',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                color: '#2563eb',
                fontWeight: 500
              } : {
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  color: '#8E9196'
                }
              }
            },
            headerTitle: { className: '' },
            content: { className: '' },
          }}
        >
          {activeTab === 'activities' && <ActivitiesTab />}
        </TabPanel>
      </TabView>
    </div>
  );
};

export default TabsSection;