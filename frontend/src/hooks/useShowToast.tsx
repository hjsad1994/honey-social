import { useToast, ToastStatus } from "@chakra-ui/react";
import { useCallback } from "react";

// Define the function signature
type ShowToastFunction = (
  title: string, 
  description: string, 
  status: ToastStatus
) => void;

const useShowToast = (): ShowToastFunction => {
  const toast = useToast();

  const showToast = useCallback(
    (title: string, description: string, status: ToastStatus): void => {
      toast({
        title,
        description,
        status,
        duration: 3000,
        isClosable: true,
      });
    }, 
    [toast]
  );

  return showToast;
};

export default useShowToast;