import { Outlet, useNavigate } from "react-router-dom";
import AppBar from "./navigation/AppBar";
import NavigationVertical from "./navigation/NavigationVertical";
import ScreenOverlayBlur from "../../common/ScreenOverlay";
import useNavigationControl from "../../common/hooks/useNavigationControl";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { listUsers } from "../../redux/reducers/apiReducers/userApiReducer";
import { getAllWahanas } from "../../redux/reducers/apiReducers/wahanaApiReducer";
import notificationManager from "../../common/utils/notificationManager";
import LoadingScreenLarge from "../../common/components/LoadingScreenLarge";

// Protected route for admin
const AdminProtected = ({ children }) => {
  const { userLoading, currentUserByCaller } = useSelector(
    (state) => state.users
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [layoutLoader, setLayoutLoader] = useState(true);
  const navigate = useNavigate();

  // layoutloader : false after userLoading false: after 2 sec. for get the Object Keys
  useEffect(() => {
    if (!userLoading) {
      setTimeout(() => {
        setLayoutLoader(false);
      }, [3000]);
    }
  }, [userLoading]);

  useEffect(() => {
    if (currentUserByCaller) {
      const isAdmin = Object.keys(currentUserByCaller.role).includes("admin");
      setIsAdmin(isAdmin);
    }
  }, [currentUserByCaller]);

  if (layoutLoader) return <LoadingScreenLarge />;
  if (isAdmin) {
    return children;
  } else {
    notificationManager.error("User is not an admin!");
    navigate("/");
  }
};

/* Main Layout */
const AdminLayout = () => {
  const { state, toggleNavigation } = useNavigationControl();
  const dispatch = useDispatch();
  const { backend } = useSelector((state) => state.authentication);

  // Initialize `selected` state from localStorage or default to 'light'
  const [selected, setSelected] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  // Save theme to localStorage whenever `selected` changes
  useEffect(() => localStorage.setItem("theme", selected), [selected]);

  const handleNavigationOnSmallScreen = () => {
    if (state.isOpen) {
      toggleNavigation(false);
    }
  };

  // Init members in admin side
  useEffect(() => {
    dispatch(listUsers({ backend: backend, pageLimit: 100, currPage: 0 }));
  }, []);

  // Fetch wahanas
  // useEffect(() => {
  //   dispatch(getAllWahanas({ backend: backend, chunkSize: 10, pageNo: 0 }));
  // }, []);

  return (
    <>
      {state.isOpen && (
        <ScreenOverlayBlur onOverlayClicked={handleNavigationOnSmallScreen} />
      )}
      <div className={`layout ${selected} h-full`}>
        <div className="text-text">
          <NavigationVertical navigationState={state} />
          <div className="flex w-full min-w-0 flex-auto flex-col bg-background h-screen overflow-y-auto sm:overflow-hidden">
            <AppBar
              toggleNavigation={toggleNavigation}
              selected={selected}
              setSelected={setSelected}
            />

            <div className="sm:overflow-y-auto custom-scroll">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
