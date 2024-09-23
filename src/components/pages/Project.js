import { v4 as uuidv4 } from "uuid";

import styles from "./Project.module.css";

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import Loading from "../layout/Loading";
import Container from "../layout/Container";
import Message from "../layout/Message";
import ProjectForm from "../project/ProjectForm";
import ServiceForm from "../service/ServiceForm";
import ServiceCard from "../service/ServiceCard";

export default function Project() {
    const { id } = useParams();

    const [project, setProject] = useState([]);
    const [services, setServices] = useState([]);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [message, setMessage] = useState();
    const [type, setType] = useState();

    useEffect(() => {
        fetch(`http://localhost:5000/projects/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((resp) => resp.json())
        .then((data) => {
            console.log(`project data:\n${JSON.stringify(data)}`)
            setProject(data)
            setServices(data.services)
        })
        .catch((err) => console.log(err))
    }, [id])

    function editPost(project) {
        setMessage("");
        
        if (project.budget < project.cost) {
            setMessage("O orçamento do projeto não pode ser menor do que o custo dos serviços!")
            setType("error")
            return(false)
        }

        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(project),
        })
            .then((resp) => resp.json())
            .then((data) => {
                setProject(data)
                setShowProjectForm(false)
                setMessage("Projeto atualizado!");
                setType("success");
            })
            .catch((err) => console.log(err))
    }

    function createService() {
        setMessage("");

        const lastService = project.services[project.services.length - 1];

        lastService.id = uuidv4();

        const newCost = parseFloat(project.cost) + parseFloat(lastService.cost);

        if (newCost > parseFloat(project.budget)) {
            setMessage("Orçamento ultrapassado. Verifique o valor do serviço.");
            setType("error");
            project.services.pop();
            return (false);
        }

        project.cost = newCost;

        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(project),
        })
        .then(setShowServiceForm(false))
        .catch((err) => console.log(err))
    }

    function removeService(id, cost) {
        setMessage("");

        const servicesUpdated = project.services.filter(
            (service) => service.id !== id
        )

        project.services = servicesUpdated;
        project.cost = parseFloat(project.cost) - parseFloat(cost);

        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(project)
        })
        .then(() => {
            setProject(project)
            setServices(servicesUpdated)
            setType("success")
            setMessage("Serviço removido com sucesso!")
        })
        .catch((err) => console.log(err))
    }

    function toggleProjectForm() {
        setShowProjectForm(!showProjectForm);
    }

    function toggleServiceForm() {
        setShowServiceForm(!showServiceForm);
    }

    let porcentagemUtilizadaOrcamento = () => {
        let porcentagem = (project.cost / project.budget) * 100;
        let porcentagemFormatada = Number(porcentagem/100).toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 2});
        return porcentagemFormatada;
    }

    let porcentagemDisponivelOrcamento = () => {
        let porcentagem = (100 - ((project.cost / project.budget) * 100))
        let porcentagemFormatada = Number(porcentagem/100).toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 2});
        if (project.cost === 0) {
            return "100%"
        } else {
            return porcentagemFormatada
        }
    }

    let BRL = new Intl.NumberFormat('pt-br', {
        style: 'currency',
        currency: 'BRL',
    });

    let getProgressBarColor = () => {
        const ratio = project.cost / project.budget;

        if (ratio < 0.5) {
            return "#4CAF50" // primary
        } else if (ratio < 0.75) {
            return "#f0ad4e" // warning
        } else {
            return "#d9534f" // danger
        }
    }

    return (
        <>
            {project.name ? (
                <div className={styles.project_details}>
                    <Container customClass="column">
                        {message && <Message type={type} msg={message} />}
                        <div className={styles.details_container}>
                            <h1>{project.name}</h1>
                            <button className={styles.btn} onClick={toggleProjectForm}>
                                {!showProjectForm ? "Editar projeto" : "Fechar"}
                            </button>
                            {!showProjectForm ? (
                                <div className={styles.project_info}>
                                    <p>
                                        <span>Categoria: </span> {project.category.name}
                                    </p>
                                    <p>
                                        <span>Orçamento: </span> {BRL.format(project.budget)}
                                    </p>
                                    <p>
                                        <span>Total Utilizado: </span> {BRL.format(project.cost)} ({porcentagemUtilizadaOrcamento()})
                                    </p>
                                    <p>
                                        <span>Total Disponível: </span> {BRL.format(project.budget - project.cost)} ({porcentagemDisponivelOrcamento()})
                                    </p>
                                    <progress className={styles.progressBar} style={{ '--progress-bar-color': getProgressBarColor() }} value={project.budget - project.cost} max={project.budget}></progress>
                                </div>
                            ) : (
                                <div className={styles.project_info}>
                                    <ProjectForm handleSubmit={editPost} btnText="Concluir edição" projectData={project} />
                                </div>
                            )}
                        </div>
                        <div className={styles.service_form_container}>
                            <h2>Adicione um serviço:</h2>
                            <button className={styles.btn} onClick={toggleServiceForm}>
                                {!showServiceForm ? "Adicionar serviço" : "Fechar"}
                            </button>
                            <div className={styles.project_info}>
                                {showServiceForm &&
                                    <ServiceForm handleSubmit={createService} btnText="Adicionar serviço" projectData={project} />
                                }
                            </div>
                        </div>
                        <h2>Serviços</h2>
                        <Container customClass="start">
                            {services.length > 0 &&
                                services.map((service) => (
                                    <ServiceCard id={service.id} name={service.name} cost={service.cost} description={service.description} key={service.id} handleRemove={removeService} />
                                ))
                            }
                            {services.length === 0 && <p>Não há serviços cadastrados.</p>}
                        </Container>
                    </Container>
                </div>
            ) : (
                <Loading />
            )}
        </>
    )
}