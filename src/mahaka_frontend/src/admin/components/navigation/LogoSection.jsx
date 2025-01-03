import { RiLogoutCircleRLine } from "react-icons/ri";
import ButtonWrapper from "../../../common/ButtonWrapper";
import { useLogout } from "../../../common/hooks/useLogout";

const LogoSection = () => {
  const logoutAndRedirect = useLogout();

  return (
    <div className="flex w-full items-center p-4 pl-6">
      <div className="font-black text-secondaryText">MAHAKA</div>
      <div className="ml-auto flex items-center cursor-pointer">
        <ButtonWrapper
          size={24}
          color="text-secondaryText hover:text-orange-400"
          actionOnButtonClick={() => logoutAndRedirect()}
          // actionOnButtonClick={() => disconnect()}
        >
          <RiLogoutCircleRLine />
        </ButtonWrapper>
      </div>
    </div>
  );
};

export default LogoSection;
