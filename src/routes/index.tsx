import { Router, Route } from "@solidjs/router";
import Home from "../pages/Home";

const Routes = () => {
  return (
    <Router>
      <Route path="/" component={Home} />
    </Router>
  );
};

export default Routes;
