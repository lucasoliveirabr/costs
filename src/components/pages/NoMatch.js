import LinkButton from "../layout/LinkButton";
import styles from "./NoMatch.module.css";

export default function NoMatch() {
    return (
        <div className={styles.body_page}>
            <h1>Ops, parece que você está no lugar errado.</h1><br />
            <p>Deseja voltar para a tela inicial?</p><br />
            <LinkButton to="/" text="Voltar" />
        </div>
    )
}