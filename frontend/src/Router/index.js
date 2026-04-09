
import Login from "../pages/Login";
import Staff from "../pages/Staff";
import Customer from "../pages/Customer";
import Register from "../pages/Register";
import CustomerLayout from "../layouts/CustomerLayout";
import AboutUs from "../pages/AboutUs";
import OperatingRegulations from "../pages/OperatingRegulations";
import TermsOfUse from "../pages/TermsOfUse";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import HomeCustomer from "../pages/HomeCustomer";
import EmptyPaking from "../pages/EmptyPaking";
import PreBooking from "../pages/PreBooking";
import Checkin from "../pages/Checkin";
import Checkout from "../pages/Checkout";
import AdminLayout from "../layouts/AdminLayout";
import StaffLayout from "../layouts/StaffLayout";
import SystemLogin from "../pages/SystemLogin";
import Profile from "../pages/Profile";
import ReservationHistory from "../pages/ReservationHistory";
import MonthlyPassCustomer from "../pages/MonthlyPassCustomer";





export const router = [
  {
    path: "/",
    element: <CustomerLayout />,
    children:[
          {
              path:"/login",
              element:<Login/>,
          },
          {
              path:"/register",
              element:<Register/>,
          }
          ,
          {
              path:"/aboutus",
              element:<AboutUs/>,
          }
          ,
          {
              path:"/operatingregulations",
              element:<OperatingRegulations/>,
          }
          ,
          {
              path:"/termsofuse",
              element:<TermsOfUse/>,
          }
           ,
          {
              path:"/privacypolicy",
              element:<PrivacyPolicy/>,
          }
          ,
          {
              path:"/",
              element:<HomeCustomer/>,
          },
          {
              path:"/emptypaking",
              element:<EmptyPaking/>,
          },
          {
              path:"/prebooking",
              element:<PreBooking/>,
          },
          {
              path:"/checkin",
              element:<Checkin/>,
          },
          {
              path:"/checkout",
              element:<Checkout/>,
          },
          {
              path:"/profile",
              element:<Profile/>,
          },
          {
              path:"/reservation",
              element:<ReservationHistory/>,
          },
          {
              path:"/monthlypasscustomer",
              element:<MonthlyPassCustomer/>,
          }
          
        ]
  },
  {
    path: "/admin",
    element: <AdminLayout />,
  },{
    path: "/staff",
    element: <StaffLayout />,
  }
  ,{
    path: "/systemlogin",
    element: <SystemLogin />,
  }
];
