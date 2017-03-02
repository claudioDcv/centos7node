window.onload = function() {

  var Lang = function(lang){
    this.text = {
      partitions : 'Partitions',
      created_by : 'Claudio Rojas',
      contact : 'claudio.dcv@gmail.com',
    }
    switch (lang) {
      case 'es':
          this.text = {
            partitions : 'Particiones',
          }
        break;
      case 'eng':
          this.text = {
            partitions : 'Partitions',
          }
        break;
      default:

    }
  }
  window.Mainframe = function(opt){

    this.lang = new Lang(opt.lang || 'es');
    this.max_partitions = opt.partitions || 10;
    this.board = new Board(this);
  }
  Mainframe.prototype.init = function(){
    this.board.init();
  }
    var Vertex = function(){
      this.name = 'vertex';
      this.toString = function(){return "vertex";}
    }
    var Edge = function(opt){
      this.name = 'edge';
      this.rotation = opt.rotation;
      this.toString = function(){
        return opt.rotation == 'h' ? 'edge-h' : 'edge-v';
      }
    }
    //1: partition 2:Border 0: Edge
    var Token = function(){
      this.name = 'token';
      this.player_id = 0;
      this.secure = false;
      this.status_played = false;
      this.top = 0;
      this.left = 0;
      this.right = 0;
      this.bottom = 0;

      this.toString = function(){return "token";}
    }
    var Partition = function(opt){
      this.name = 'partition';
      this.secure = false;
      this.rotation = opt.rotation;
      this.toString = function(){
        return opt.rotation == 'h' ? 'partition-h' : 'partition-v';
      }
    }
    var Zone = function(){
      this.name = 'zone';
      this.secure = false;
      this.belongsToParticipant = 0;
      this.top = 0;
      this.left = 0;
      this.right = 0;
      this.bottom = 0;

      this.toString = function(){return "zone";}
    }
    var GenericProgram  = function(){
      this.name = 'generic-program';
      this.id = 0;
      this.player = false;
      this.status_played = false;
    }
    var PlayerProgram = function(){
      this.name = 'player-program';
      this.id = 0;
      this.player_id = 0;
      this.status_played = false;
    }

    var GenericDiscard = function(){
      this.name = 'generic-discard';
      this.list_program = [];
    }

    var Player = function(){
      this.name = 'player';
      ths.id = 0;
      this.list_program = [];
      this.list_generic_program = [];
      this.list_token = [];
    }

    window.Board = function(mainframe){
      this.mainframe = mainframe;
      this.stage = [];
      this.partitions = 0;
      this.max_partitions = mainframe.max_partitions;
    }
    Board.prototype.init = function(){
      for (var i = 0; i < 17; i++) {
        this.stage[i] = [];
        for (var j = 0; j < 13; j++) {

          if (i%2) {
            if (j%2) {
              this.stage[i].push(new Zone());
            }else{
              this.stage[i].push(new Edge({rotation:'v'}));
            }
          }else{
            if (j%2) {
              this.stage[i].push(new Edge({rotation:'h'}));
            }else{
              this.stage[i].push(new Vertex());
            }
          }

        }
      }
      this.update()
    }
    //x 13, y 17
    Board.prototype.addPartition = function(obj){

      if (this.partitions == this.max_partitions) {
        return false;
      }

      var x = obj.x;
      var y = obj.y;

      if (this.stage[y][x].name == 'edge') {
        if (this.isPosibleAddPartition()) {

            this.partitions++;

          this.stage[y][x] = new Partition({rotation:this.stage[y][x].rotation});

          //zona superior update
          if (this.stage[y-1] !== undefined && this.stage[y-1][x] !== undefined &&
              (
                this.stage[y-1][x].name == 'zone' || 
                this.stage[y-1][x].name == 'token'
              )
            ) {
            this.stage[y-1][x].bottom = 1;
          }
          if (this.stage[y+1] !== undefined && this.stage[y+1][x] !== undefined &&
              (
                this.stage[y+1][x].name == 'zone' || 
                this.stage[y+1][x].name == 'token'
              )
            ) {
            this.stage[y+1][x].top = 1;
          }
          if (this.stage[y] !== undefined && this.stage[y][x-1] !== undefined &&
              (
                this.stage[y][x-1].name == 'zone' || 
                this.stage[y][x-1].name == 'token'
              )
            ) {
            this.stage[y][x-1].right = 1;
          }
          if (this.stage[y] !== undefined && this.stage[y][x+1] !== undefined &&
              (
                this.stage[y][x+1].name == 'zone' || 
                this.stage[y][x+1].name == 'token'
              )
            ) {
            this.stage[y][x+1].left = 1;
          }

          return this.update()
        }
      }

      console.error('Not is Edge')
      return false;
    }
    Board.prototype.removePartition = function(obj){
      if (this.partitions == 0) {
        return false;
      }

      var x = obj.x;
      var y = obj.y;

      if (this.stage[y][x].name == 'partition') {
        if (this.isPosibleRemovePartition()) {

            this.partitions --;

          this.stage[y][x] = new Edge({rotation:this.stage[y][x].rotation});
          return this.update()
        }
      }

      console.error('Not is Edge')
      return false;
    }

    Board.prototype.addToken = function(obj,token){
      var x = obj.x;
      var y = obj.y;
      if (this.stage[y][x].name == 'zone') {
        this.stage[y][x] = token;
        return this.update()
      }
      console.error('Not is Zone')
      return false;
    }
    Board.prototype.changeToken = function(obj,token){
      var x = obj.x;
      var y = obj.y;
      if (this.stage[y][x].name == 'token') {
        this.stage[y][x] = token;
        return this.update()
      }
      console.error('Not is Token')
      return false;
    }
    Board.prototype.removeToken = function(obj,token){
      var x = obj.x;
      var y = obj.y;
      if (this.stage[y][x].name == 'token') {
        this.stage[y][x] = new Zone();
        return this.update()
      }
      console.error('Not is Token')
      return false;
    }

    //Evaluar si el token cierra una zona
    //Si cierra una zona evaluar si existe algun token adentro
    Board.prototype.isPosibleAddPartition = function(obj){
      //
      return true;
    }
    Board.prototype.isPosibleRemovePartition = function(obj){
      //
      return true;
    }
    //Averiguar si particion pertenece a zona segura
    Board.prototype.partitionBelongsToSafeZone = function(){

    }

    Board.prototype.update = function(){
      var f = (x,y) => x*y*2+x+y;
      //recorrer toda la tabla y aplicar cambios
      //como zonas seguras y particiones inamovibles
      //console.table(this.stage)
      document.body.innerHTML = '';
      var container = document.createElement('div');
          container.className = 'container';
      //print game
      for (var i = 0; i < this.stage.length; i++) {
        this.stage[i]
        var line = document.createElement('div');
            line.className = 'line';
        for (var j = 0; j < this.stage[i].length; j++) {
          var elm = this.stage[i][j]
          var piece = document.createElement('div');
              piece.className = elm.toString();
              if (elm.toString() == 'edge-h' || elm.toString() == 'edge-v') {
                piece.dataset.i = i;
                piece.dataset.j = j;
                piece.addEventListener('click',this._fn_add_partition.bind(this),false);
              }

              if (elm.toString() == 'partition-h' || elm.toString() == 'partition-v') {
                piece.dataset.i = i;
                piece.dataset.j = j;
                piece.addEventListener('click',this._fn_remove_partition.bind(this),false);
              }

          line.appendChild(piece)
        }
        container.appendChild(line);
      }
      document.body.appendChild(container);

      //f(6,8)-this.partitions + '/' + Disponible Vertex
      var counter = document.createElement('div');
          var counterTitleText = document.createTextNode(this.mainframe.lang.text.partitions);
          var counterTitle = document.createElement('div');
              counterTitle.appendChild(counterTitleText);
          counter.className = "counter";
      var textCounter = document.createTextNode(this.max_partitions-this.partitions);
          counter.appendChild(textCounter);
          counter.appendChild(counterTitle);
          document.body.appendChild(counter);
      return true;
    }

    Board.prototype._fn_add_partition = function(event){
      this.addPartition({x:event.srcElement.dataset.j,y:event.srcElement.dataset.i})
    }

    Board.prototype._fn_remove_partition = function(event){
      this.removePartition({x:event.srcElement.dataset.j,y:event.srcElement.dataset.i})
    }

    window.mainframe = new Mainframe({
      lang:'es',
      partitions: 95,
    });
    mainframe.init();
};
