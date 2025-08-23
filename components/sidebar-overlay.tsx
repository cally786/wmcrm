export function SidebarOverlay() {
  console.log("🔧 SidebarOverlay: ULTRA SIMPLE VERSION!")
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: '60px',
        left: '10px',
        zIndex: 9999,
        backgroundColor: 'red',
        color: 'white',
        padding: '10px',
        cursor: 'pointer'
      }}
      onClick={() => console.log("🔧 RED DIV CLICKED!")}
    >
      TEST MENU
    </div>
  )
}