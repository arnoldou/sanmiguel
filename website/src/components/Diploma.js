import React, { useState, useEffect } from "react"
import { withRouter } from "react-router-dom"
import "moment/locale/es"
import { Nav, Loader } from "./parts"
import { nameParser } from "./Home.helpers"
import DiplomaLayout from "./DiplomaLayout"
import "node-snackbar/dist/snackbar.min.css"
import { ShareBox } from "./Diploma.parts"
import { renderDiploma, save } from "./Diploma.helpers"
const yaml = require("js-yaml")
const moment = require("moment")
moment.locale("es")
const url =
  "https://raw.githubusercontent.com/nodeschool/sanmiguel/master/reconocimientos/"

export default withRouter(
  ({
    match: {
      params: { pal, topic, raw = "" }
    },
    location: { pathname }
  }) => {
    const isRaw = raw === "raw"
    console.log("isRaw: " + isRaw)
    const [info, setInfo] = useState(false)
    const fetchData = async () => {
      const req = await fetch(url + `${pal.split("_").join("%20")}.yml`)
      const data = await req.text()
      setInfo(yaml.load(data))
    }
    useEffect(() => {
      info || fetchData()
    }, [info])
    const topicKey = topic.split("_").join(" ")
    const curTopic = info && info.tema[topicKey]
    const diplomaURL = `https://nodeschool.io/sanmiguel/#${pathname.substr(
      1
    )}`.replace(/\/raw$/, "")
    const {
      titulo = false,
      fecha = false,
      tipo = false,
      codevent = false,
      version = "1.0"
    } = curTopic
    const [diploma, setDiploma] = useState(false)
    const [diplomaBlob, setBlob] = useState({ img: null, pdf: null })
    const [modal, showModal] = useState(false)
    const MainLayout = () => {
      return (
        <div className="container content">
          <div className="pa3 flex flex-column min-vh-100">
            <Nav
              title={
                info
                  ? `${info.nombre} / ${titulo}`
                  : `${nameParser(pal.split("_").join(" "))} / ${nameParser(
                      topicKey
                    )}`
              }
              to={pathname
                .split("/")
                .slice(0, -1)
                .join("/")}
            />
            {diploma ? (
              <>
                <div className="flex-grow-1 w-100 items-center justify-center flex">
                  {diploma}
                </div>
                <div className="buttons is-right mt3">
                  <div
                    title="Descargar como una imagen PNG"
                    onClick={() =>
                      save({
                        blob: diplomaBlob.img,
                        name: encodeURI(`${pal}-${topic}`),
                        format: "png"
                      })
                    }
                    className="button is-warning is-small">
                    <i className="icon ion-md-image" />
                    <span>Descargar PNG</span>
                  </div>
                  <div
                    title="Descargar en formato PDF"
                    onClick={() =>
                      save({
                        blob: diplomaBlob.pdf,
                        name: encodeURI(`${pal}-${topic}`),
                        format: "pdf"
                      })
                    }
                    className="button is-warning is-inverted is-small">
                    <i className="icon ion-md-document" />
                    <span>Descargar PDF</span>
                  </div>
                  <div
                    title="Obtener URL para compartir el reconocimiento"
                    onClick={() => showModal(true)}
                    className="button is-black is-small is-outlined">
                    <span>Compartir</span>
                    <i className="icon ion-md-share-alt" />
                  </div>
                </div>
              </>
            ) : (
              <Loader />
            )}
          </div>
        </div>
      )
    }

    if (diploma && isRaw)
      window.location.href = diploma.props.style.backgroundImage.slice(4, -1)
    return (
      <div className="Diploma has-background-warning">
        {modal && (
          <ShareBox data={diplomaURL} onHide={() => showModal(false)} />
        )}
        {!diploma && info && (
          <DiplomaLayout
            url={diplomaURL}
            date={moment(fecha, "DD-MM-YYYY").format(
              "dddd DD [de] MMMM [del] YYYY"
            )}
            name={info.nombre}
            type={tipo}
            tema={titulo}
            isCodevent={codevent}
            version={version}
            onRender={blob => {
              console.log("Update")
              renderDiploma({ blob, setDiploma, setBlob })
            }}
          />
        )}
        {isRaw ? <Loader className="vh-100">GENERANDO</Loader> : <MainLayout />}
      </div>
    )
  }
)