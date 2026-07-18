import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container py-5 text-center">

      <h1 className="display-4 fw-bold text-primary">
        Student Super App
      </h1>

      <p className="lead mt-3">
        One Platform for Every Student Need
      </p>

      <img
        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        alt="student"
        width="180"
        className="my-4"
      />

      <div className="mt-4">

        <Link to="/login" className="btn btn-primary me-3 px-4">
          Login
        </Link>

        <Link to="/register" className="btn btn-success px-4">
          Register
        </Link>

      </div>

    </div>
  );
}

export default Home;