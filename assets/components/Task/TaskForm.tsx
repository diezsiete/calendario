export default function TaskForm() {
    return (
        <form noValidate={true}>
            <div className="form-floating mb-3">
                <input type="text" className="form-control" id="taskName" placeholder="Nombre"/>
                <label htmlFor="taskName">Nombre</label>
            </div>
            <div className="form-floating">
                <textarea className="form-control" id="taskDescription" style={{height: '150px'}}></textarea>
                <label htmlFor="taskDescription">Descripción</label>
            </div>
        </form>
    )
}