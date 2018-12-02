function gg(){
    this.tt = 44;
    const _this = this;
    document.addEventListener('click', function(){
        _this.clk();
    });
}

gg.prototype.clk = function(){
    console.dir(this);
    console.log(this.tt);
}

const g = new gg();
g.clk();