import BannerCarousel from "../../components/HomeCustomer/BannerCarousel";
import HomeIntro from "../../components/HomeCustomer/HomeIntro/HomeIntro";
import HomeParking from "../../components/HomeCustomer/HomeParking/HomeParking";
import HomeSearch from "../../components/HomeCustomer/HomeSearch/HomeSearch";
import HomeSteps from "../../components/HomeCustomer/HomeSteps/HomeSteps";
import ParkingIntro from "../../components/HomeCustomer/ParkingIntro/ParkingIntro";
import QuickSearchParking from "../../components/HomeCustomer/QuickSearchPaking/QuickSearchParking";

function HomeCustomer(){
  return(
    <>
      <BannerCarousel/>
      <QuickSearchParking/>
      <HomeSearch/>
      <HomeSteps/>
      <HomeParking/>
      <HomeIntro/>
      <ParkingIntro/>
    </>
  )
}

export default HomeCustomer;