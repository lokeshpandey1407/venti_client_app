import React from 'react'

const Modal = ({ title, body }) => {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: "50",
            }}
        >
            <div
                style={{
                    width: "fit-content",
                    maxWidth: "75vw",
                    padding: "2rem 1rem",
                    borderRadius: "1rem",
                    textAlign: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    color: "black",
                }}
            >
                <h2 style={{ width: "100%", borderBottom: "2px solid #aaa" }}>
                    {title}
                </h2>
                <p>{body}</p>
            </div>
        </div>
    )
}

export default Modal
