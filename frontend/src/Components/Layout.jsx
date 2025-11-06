import Footer from "./Footer";
import PageNav from "./PageNav";

function Layout({children}){
    
    return(
        <div className='min-h-screen'>
        <PageNav/>
        {children}
        <Footer/>
        </div>
    )
}
export default Layout