function searchController() {
    return {
      //! Search page display
      searchpage : function (req, res){
          var payload = createPayload(req.session.user)
          res.status(200).render("client/searchPage", payload);
      },
      //! Search page tabs
      searchtabs : function (req, res){
          var payload = createPayload(req.session.user)
          payload.selectedTab = req.params.selectedTab;
          res.status(200).render("client/searchPage", payload);
      }
    };
  }
  
  //! (globle function)
  function createPayload(userLoggedIn) {
      return {
          pageTitle: "Search",
          userLoggedIn: userLoggedIn,
          userLoggedInJs: JSON.stringify(userLoggedIn)
      };
  }
  
  module.exports = searchController;
  