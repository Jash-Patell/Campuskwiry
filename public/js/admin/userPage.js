$(document).ready(() => {
    $.get("/userManagment/userdetail", results => {
      console.log(results);
       outputuserdetail(results, $(".container-fluid"));
    })
  })
  
  function outputuserdetail(results, container) {
    container.html(`
    <br>
    <br>
    <br>
    <br>
    <!-- DataTales Example -->
    <div class="card shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">Full User Detail</h6>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
            <thead>
              <tr>
                <th>User Name</th>
                <th>User Email</th>
                <th>Total Post</th>
                <th>Total Upvote</th>
                <th>Total Downvote</th>
                <th>Total Reasked</th>
              </tr>
            </thead>
            `);

        // for (const result in results) {
        //   var html = Userdetail(result)
        //   console.log(html);
        //   container.append(html);
        // }

        Object.values(results).forEach(result => {
          var html = Userdetail(result)
          console.log(html);
            container.append(html)
        });

   if (results.length == 0) {
       container.append("<span class='noResults'>Nothing to show.</span>")
   }
  }
 
  function Userdetail(result) {
     
    var Username = result.username;
    var Useremail = result.email;
    var totalpost = result.total_posts
    var totalupvote = result.total_likes;
    var totaldownvote = result.total_dislikes;
    var totalreasked = result.total_Reasked;
   
    return `
              <tbody>
                <tr>
                  <td>${Username}</td>
                  <td>${Useremail}</td>
                  <td>${totalpost}</td>
                  <td>${totalupvote}</td>
                  <td>${totaldownvote}</td>
                  <td>${totalreasked}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- /.container-fluid -->
 `;
 }