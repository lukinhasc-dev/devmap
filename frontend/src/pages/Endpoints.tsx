import DefaultPage from "./DefaultPage";
import EndpointTester from "../components/EndpointTester";
import "../styles/DefaultPage.css";
import "../styles/Endpoints.css";

export default function Endpoints() {
    return (
        <DefaultPage
            tittle="Endpoints"
            description="Teste qualquer URL da sua API e veja a resposta em tempo real."
        >
            <EndpointTester
                hint="Para cadastrar endpoints, acesse um projeto → aba Endpoints."
            />
        </DefaultPage>
    );
}
