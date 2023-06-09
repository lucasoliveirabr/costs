import { Link } from "react-router-dom";
import styles from "./ProjectCard.module.css";

import {BsPencil, BsFillTrashFill} from "react-icons/bs";

import { useState, useEffect } from "react";

export default function ProjectCard({id, name, budget, category, handleRemove}) {

    const remove = (e) => {
        e.preventDefault();
        handleRemove(id);
    }

    const [services, setServices] = useState([]);
    useEffect(() => {
        fetch(`http://localhost:5000/projects/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((resp) => resp.json())
        .then((data) => {
            setServices(data.services)
        })
        .catch((err) => console.log(err))
    }, [id])

    return (
        <div className={styles.project_card}>
            <h4>{name}</h4>
            <p>
                <span>Orçamento:</span> R${budget}
                <br /><span>Serviços:</span> {services.length}
            </p>
            <p className={styles.category_text}>
                <span className={`${styles[category?.toLowerCase() || ""]}`}></span> {category}
            </p>
            <div className={styles.project_card_actions}>
                <Link to={`/project/${id}`}>
                    <BsPencil/> Editar
                </Link>
                <button onClick={remove}>
                    <BsFillTrashFill/> Excluir
                </button>
            </div>
        </div>
    )
}