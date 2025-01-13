import Modal from "./Modal";

function Login({ onClose }) {

    const title = 'Register';
    // TODO: implement submitHandle
    const handleSubmit = (e) => e.preventDefault();
    return (
        <Modal title={title} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="emailAddress" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="emailAddress" placeholder="name@example.com" />
                    <label htmlFor="inputPassword" className="form-label">Password</label>
                    <input type="password" className="form-control" id="inputPassword" aria-describedby="passwordHelpBlock" />
                    <div id="passwordHelpBlock" class="form-text">
                        Passwords must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols
                    </div>
                    <div className="button-group">
                        <button type="button" className="btn btn-danger" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-success">Submit</button>
                    </div>
                </div>
            </form>
        </Modal>
    );

}

export default Login;