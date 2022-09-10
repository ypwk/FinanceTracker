import { Link } from 'react-router-dom';

const Navi = function () {
  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/login/">Add an Institution</Link>
    </div>
  );
};

/*
<button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#navDrawer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-list"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
          />
        </svg>
      </button>

      <div
        className="modal fade"
        id="navDrawer"
        aria-labelledby="navigationDrawer"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Finance Tracker
              </h5>
            </div>
            <div className="modal-body">

            </div>
          </div>
        </div>
      </div>
  */

export default Navi;
