import { Button, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <Link to={"/trantantai"}>
            <Flex w={"full"} justifyContent={"center"}>
                <Button colorScheme="blue" size="lg" mt={4}>
                    Go to User Page
                </Button>
            </Flex>
        </Link>
    )
}
export default HomePage