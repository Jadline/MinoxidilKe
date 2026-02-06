import FeaturedProducts from "../Components/FeaturedProducts"
import HeroSection from "../Components/HeroSection"
import PromoSection from "../Components/PromoSection"
import { HomeSEO } from "../Components/SEO"

function Home(){
    return(
        <>
            <HomeSEO />
            <HeroSection/>
            <FeaturedProducts/>
            <PromoSection/>
        </>
    )
}
export default Home