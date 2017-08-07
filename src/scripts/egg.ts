class Egg{

	activateFun(){
		document.addEventListener("click", function(){
			console.info("FUN ACTIVATED");
		});
	}

	constructor(){
		let counter = 0;
		document.addEventListener('keydown', (event) => {
			
			if(event.key == "b")
			{
				counter=1;
			}
			else if(counter == 1 && event.key == "i")
			{
				counter=2;
			}
			else if(counter == 2 && event.key == "e")
			{
				counter=3;
			}
			else if(counter == 3 && event.key == "n")
			{
				counter=4;
			}
			else if(counter == 4 && event.key == "e")
			{
				this.activateFun();
			}
			else{
				counter = 0;
			}
		});
	}
}

document.addEventListener("DOMContentLoaded", ()=>{
	let egg = new Egg();
});