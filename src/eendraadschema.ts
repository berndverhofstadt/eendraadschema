declare var pako: any;

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function isInt(value) {
  return !isNaN(value) &&
         parseInt(value) == value &&
         !isNaN(parseInt(value, 10));
}

function flattenSVG(SVGstruct,shiftx,shifty,node) {
  var str:string = "";

  var X = new XMLSerializer()
  var parser = new DOMParser();

  var outstruct = SVGstruct;
  if (SVGstruct.localName == "svg") {
    if (outstruct.attributes.getNamedItem("x")) { // make SVG a 0,0 element
      shiftx += parseFloat(outstruct.attributes.getNamedItem("x").nodeValue);
      outstruct.attributes.getNamedItem("x").nodeValue = 0;
    }
    if (outstruct.attributes.getNamedItem("y")) { // make SVG a 0,0 element
      shifty += parseFloat(outstruct.attributes.getNamedItem("y").nodeValue);
      outstruct.attributes.getNamedItem("y").nodeValue = 0;
    }
    for (var i = 0; i < SVGstruct.children.length; i++) {
      str = str.concat(flattenSVG(SVGstruct.children[i],shiftx,shifty,node+1),"\n");
    }
    if (node <= 0) {
      //---output[0] = outstruct;
      if (outstruct.attributes.getNamedItem("width")) { // make SVG a 0,0 element
        str = '<svg width="' + (outstruct.attributes.getNamedItem("width").nodeValue)  +
                    '" height="' + (outstruct.attributes.getNamedItem("height").nodeValue) + '">' + str + '</svg>';
      } else {
        str = '<svg>' + str + '</svg>';
      }
    }
  } else {
    if (SVGstruct.localName == "line") {
      if (shiftx != 0) {
        outstruct.attributes.getNamedItem("x1").nodeValue = parseFloat(outstruct.attributes.getNamedItem("x1").nodeValue) + shiftx;
        outstruct.attributes.getNamedItem("x2").nodeValue = parseFloat(outstruct.attributes.getNamedItem("x2").nodeValue) + shiftx;
      }
      if (shifty != 0) {
        outstruct.attributes.getNamedItem("y1").nodeValue = parseFloat(outstruct.attributes.getNamedItem("y1").nodeValue) + shifty;
        outstruct.attributes.getNamedItem("y2").nodeValue = parseFloat(outstruct.attributes.getNamedItem("y2").nodeValue) + shifty;
      }
    }
    if (SVGstruct.localName == "use") {
      if (shiftx != 0) {
        outstruct.attributes.getNamedItem("x").nodeValue = parseFloat(outstruct.attributes.getNamedItem("x").nodeValue) + shiftx;
      }
      if (shifty != 0) {
        outstruct.attributes.getNamedItem("y").nodeValue = parseFloat(outstruct.attributes.getNamedItem("y").nodeValue) + shifty;
      }
    }
    if (SVGstruct.localName == "rect") {
      if (shiftx != 0) {
        outstruct.attributes.getNamedItem("x").nodeValue = parseFloat(outstruct.attributes.getNamedItem("x").nodeValue) + shiftx;
      }
      if (shifty != 0) {
        outstruct.attributes.getNamedItem("y").nodeValue = parseFloat(outstruct.attributes.getNamedItem("y").nodeValue) + shifty;
      }
    }
    if (SVGstruct.localName == "circle") {
      if (shiftx != 0) {
        outstruct.attributes.getNamedItem("cx").nodeValue = parseFloat(outstruct.attributes.getNamedItem("cx").nodeValue) + shiftx;
      }
      if (shifty != 0) {
        outstruct.attributes.getNamedItem("cy").nodeValue = parseFloat(outstruct.attributes.getNamedItem("cy").nodeValue) + shifty;
      }
    }
    if (SVGstruct.localName == "text") {
      outstruct.attributes.getNamedItem("x").nodeValue = parseFloat(outstruct.attributes.getNamedItem("x").nodeValue) + shiftx;
      outstruct.attributes.getNamedItem("y").nodeValue = parseFloat(outstruct.attributes.getNamedItem("y").nodeValue) + shifty;
      if (outstruct.attributes.getNamedItem("transform")) {
        outstruct.attributes.getNamedItem("transform").value = "rotate(-90 " +
        outstruct.attributes.getNamedItem("x").nodeValue + "," +
        outstruct.attributes.getNamedItem("y").nodeValue + ")";
      }
    }
    if (SVGstruct.localName == "polygon") {
      var polystr_out = "";
      var polystr_in = outstruct.attributes.getNamedItem("points").nodeValue;
      var splitted_in = polystr_in.split(" ");
      for (var countstr = 0; countstr < splitted_in.length; countstr++) {
        var points_in = splitted_in[countstr].split(",");
        polystr_out += (points_in[0]*1+shiftx) + ',' + (points_in[1]*1+shifty);
        if (countstr < splitted_in.length-1) { polystr_out += ' ' }
      }
      outstruct.attributes.getNamedItem("points").nodeValue = polystr_out;
    }
    str = X.serializeToString(outstruct);

    //remove all the xmlns tags
    var regex = /xmlns="[^"]+"/g;
    str = str.replace(regex, '');
  }
  return str;
}

function flattenSVGfromString(xmlstr) {
  var str:string = "";
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(xmlstr, "text/xml"); //important to use "text/xml"
  //str = flattenSVG(xmlDoc.children[0],0,0,0);
  str = flattenSVG(xmlDoc.childNodes[0],0,0,0);
  return str;
}

function htmlspecialchars(my_input)
{
    var str:string
    if (isNaN(my_input)) str = my_input; else str=my_input.toString();

    var map =
    {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function(m) {return map[m];});
}

function browser_ie_detected()
{
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var trident = ua.indexOf('Trident/');


    if ( (msie > 0) || (trident > 0) ) return true; else return false;
}
class SVGelement {
  data: string;
  xleft: number;
  xright: number;
  xrightmin: number; //is basically the full width of an array of horizontal items excluding the xright of the last item
  yup: number;
  ydown: number;

  constructor() {
    this.data = "";
    this.xleft = 0;
    this.xright = 0;
    this.xrightmin = 0;
    this.yup = 0;
    this.ydown = 0;
  }
}
class List_Item {
    id: number;
    parent: number;
    indent: number;
    Parent_Item: List_Item;
    collapsed: Boolean;

    keys: Array<[string,string,any]>;

    constructor() {
        this.id = 0; //undefined
        this.parent = 0; //no parent
        this.indent = 0; //at root note, no parent
        this.collapsed = false; //at the start, nothingh is collapsed
        this.keys = new Array<[string,string,any]>();
    }

    resetKeys() {
    }

    getMaxNumChilds(Parent?: List_Item) : number {
      return(2^24);
    }

    setKey(key: string, setvalue: any) {
      for (var i: number = 0; i<this.keys.length; i++) {
        if (this.keys[i][0]==key) {
          this.keys[i][2] = setvalue;
        }
      }
    }

    getKey(key: string) {
      for (var i: number = 0; i<this.keys.length; i++) {
        if (this.keys[i][0]==key) {
          return(this.keys[i][2]);
        }
      }
    }

    stringToHTML(keyid: number, size?: number) {
      let output:string = "";
      let sizestr:string = "";
      switch(size) {
        case null: break;
        default:
          sizestr = ' size="'+size+'" ';
      }
      output += "<input type=\"text\""+sizestr+" id=\"" + "HL_edit_"+this.id+"_"+this.keys[keyid][0] +
                "\" onchange=HLUpdate("+this.id+",\""+this.keys[keyid][0]+"\",\""+
                this.keys[keyid][1]+"\",\""+"HL_edit_"+this.id+"_"+this.keys[keyid][0]+
                "\") value=\"" + this.keys[keyid][2] + "\">";
      return(output);
    }

    checkboxToHTML(keyid: number) {
      let output:string = "";
      output += "<input type=\"checkbox\" id=\"" + "HL_edit_"+this.id+"_"+this.keys[keyid][0] + "\" onchange=HLUpdate("+this.id+",\""+this.keys[keyid][0]+"\",\""+this.keys[keyid][1]+"\",\""+"HL_edit_"+this.id+"_"+this.keys[keyid][0]+"\")"+(this.keys[keyid][2] ? ' checked' : '')+">";
      return(output);
    }

    selectToHTML(keyid: number, items: Array<String>) {
      var myId = "HL_edit_"+this.id+"_"+this.keys[keyid][0];
      var myType = this.keys[keyid][1];
      var output: String = "";
      var options: string = "";

      output += "<select id=\""+myId+"\" onchange=HLUpdate("+this.id+",\""+this.keys[keyid][0]+"\",\""+this.keys[keyid][1]+"\",\""+myId+"\")>";
      for (var i:number=0; i<items.length; i++) {
        options = "";
        if (this.keys[keyid][2]==items[i]) { options += " selected"; }
        if (items[i] == "---") {
          options += " disabled";
          items[i] = "---------------------------";
        }
        if (items[i] == "-") {
          options += " disabled";
          items[i] = "---";
        }
        output += '<option value="' + items[i] + '" ' + options + '>' + items[i] + '</option>';
      }
      output += "</select>"

      return(output);
    }

    toHTML(mode: string, Parent?: List_Item) {
      return("toHTML() function not defined for base class List_Item. Extend class first.");
    }

    toSVG(hasChild: Boolean = false) {
      let mySVG:SVGelement = new SVGelement();
      return(mySVG);
    }

    updateConsumers() {
    } //Empty container class --> only in extended functions
}
class Electro_Item extends List_Item {
  consumers:Array<String>;

  //-- Constructor, can be invoked with the List_Item of the parent to know better what kind of
  //   elements are acceptable (e.g. not all parent can have all possible childs) --

  constructor(Parent?: List_Item) {
    super();
    this.keys.push(["type","SELECT",""]); //0
    this.keys.push(["geaard","BOOLEAN",true]); //1
    this.keys.push(["kinderveiligheid","BOOLEAN",true]); //2
    this.keys.push(["accumulatie","BOOLEAN",false]); //3
    this.keys.push(["aantal","SELECT","1"]); //4
    this.keys.push(["lichtkring_poligheid","SELECT","enkelpolig"]); //5
    this.keys.push(["ventilator","BOOLEAN",false]); //6
    this.keys.push(["zekering","SELECT","automatisch"]); //7
    this.keys.push(["amperage","STRING","20"]); //8
    this.keys.push(["kabel","STRING","XVB 3G2,5"]); //9
    this.keys.push(["naam","STRING",""]); //10
    this.keys.push(["differentieel_waarde","STRING","300"]); //11
    this.keys.push(["kabel_aanwezig","BOOLEAN",true]); //12, In eerste plaats om aan te geven of er een kabel achter een zekering zit.
    this.keys.push(["aantal2","SELECT","1"]); //13, a.o. gebruikt voor aantal lampen of aantal knoppen op drukknop_armatuur
    this.keys.push(["voltage","STRING","230V/24V"]); //14, a.o. gebruikt voor aantal lampen
    this.keys.push(["commentaar","STRING",""]); //15, extra tekstveld
    this.keys.push(["select1","SELECT","standaard"]); //16, algemeen veld
      //Indien lichtpunt, select1 is het type van licht (standaard, TL, ...)
      //Indien drukknop, select1 kan "standaard", "dimmer" or "rolluik" zijn
      //Indien vrije tekst, select1 kan "verbruiker" of "zonder kader" zijn
      //Indien ketel, type is het soort verwarming
      //Indien stopcontact, select1 is het aantal fasen
    this.keys.push(["select2","SELECT","standaard"]); //17, algemeen veld
      //Indien lichtpunt, select2 is de selector voor het type noodverlichting (indien aanwezig)
      //Indien vrije tekst kan "links", "centreer", "rechts" zijn
      //Indien differentieel of aansluiting, kan type "", "A", of "B" zijn
    this.keys.push(["select3","SELECT","standaard"]); //18, algemeen veld
    this.keys.push(["bool1","BOOLEAN",false]); //19, algemeen veld
      //Indien lichtpunt, bool1 is de selector voor wandverlichting of niet
      //Indien drukknop, bool1 is de selector voor afgeschermd of niet
      //Indien schakelaar/lichtcircuit, bool1 is de selector voor signalisatielamp of niet
      //Indien vrije tekst, bool1 is de selector voor vet
      //Indien stopcontact, bool1 is de selector voor ingebouwde schakelaar
    this.keys.push(["bool2","BOOLEAN",false]); //20, algemeen veld
      //Indien lichtpunt, schakelaar, drukknop of stopcontact, bool2 is de selector voor halfwaterdicht of niet
      //Indien vrije tekst, bool2 is de selector voor schuin
      //Indien ketel, bool2 is de selector voor energiebron
      //Indien kring, bool2 is de selector voor selectieve differentieel
      //Indien stopcontact, bool2 is de selector voor halfwaterdicht
    this.keys.push(["bool3","BOOLEAN",false]); //21, algemeen veld
      //Indien lichtpunt, bool3 is de selector voor ingebouwde schakelaar of niet
      //Indien schakelaar of drukknop, bool3 is de selector voor verklikkerlamp of niet
      //Indien vrije tekst, bool3 is de selector voor warmtefunctie
      //Indien stopcontact, bool3 is de selector voor meerfasig
    this.keys.push(["string1","STRING",""]); //22, algemeen veld
      //Indien vrije tekst, breedte van het veld
    this.keys.push(["string2","STRING",""]); //23, algemeen veld
      //Indien vrije tekst, het adres-veld (want reeds gebruikt voor de tekst zelf)
    this.keys.push(["string3","STRING",""]); //24, algemeen veld
    this.keys.push(["bool4","BOOLEAN",false]); //25, algemeen veld
      //Indien schakelaar, indicatie trekschakelaar of niet
      //Indien stopcontact, bool4 is de selector voor nulgeleider of niet

    this.updateConsumers(Parent);
  }

  //-- When called, this one ensures we cannot have a child that doesn't align with its parent --

  updateConsumers(Parent?: List_Item) {
    this.Parent_Item = Parent;

    if (Parent == null) {
      this.consumers = ["", "Kring", "Aansluiting"];
    } else {
      switch (Parent.getKey("type")) {
        case "Bord": {
          this.consumers = ["", "Kring"];
          break;
        }
        case "Splitsing":
        case "Domotica": {
          this.consumers = ["", "Kring"];
          break;
        }
        case "Kring": {
          this.consumers = ["", "Aansluiting", "Bord", "Domotica", "Kring", "Meerdere verbruikers", "Splitsing", "---", "Batterij", "Bel", "Boiler", "Diepvriezer", "Droogkast", "Drukknop", "Elektriciteitsmeter", "Elektrische oven", "EV lader", "Ketel", "Koelkast", "Kookfornuis", "Lichtcircuit", "Lichtpunt", "Microgolfoven", "Motor", "Omvormer", "Overspanningsbeveiliging", "Schakelaars", "Stopcontact", "Stoomoven", "Transformator", "USB lader", "Vaatwasmachine", "Ventilator", "Verlenging", "Verwarmingstoestel", "Vrije tekst", "Wasmachine", "Zonnepaneel", "---", "Aansluitpunt",
                            "Aftakdoos", "Leeg"];
          break;
        }
        case "Meerdere verbruikers": {
          this.consumers = ["", "Domotica", "Splitsing", "---", "Batterij", "Bel", "Boiler", "Diepvriezer", "Droogkast", "Drukknop", "Elektriciteitsmeter", "Elektrische oven", "EV lader", "Ketel", "Koelkast", "Kookfornuis", "Lichtcircuit", "Lichtpunt", "Omvormer", "Overspanningsbeveiliging", "Microgolfoven", "Motor", "Schakelaars", "Stopcontact", "Stoomoven", "Transformator", "USB lader", "Vaatwasmachine", "Ventilator", "Verlenging", "Verwarmingstoestel", "Vrije tekst", "Wasmachine", "Zonnepaneel", "---", "Aansluitpunt",
                            "Aftakdoos", "Leeg"];
          break;
        }
        case "Aansluiting": {
          this.consumers = ["", "Bord", "Kring", "Splitsing"];
          break;
        }
        default: {
          this.consumers = ["", "Aansluiting", "Domotica", "Meerdere verbruikers", "Splitsing", "---", "Batterij", "Bel", "Boiler", "Diepvriezer", "Droogkast", "Drukknop", "Elektriciteitsmeter", "Elektrische oven", "EV lader", "Ketel", "Koelkast", "Kookfornuis", "Lichtcircuit", "Lichtpunt", "Omvormer", "Overspanningsbeveiliging", "Microgolfoven", "Motor", "Schakelaars", "Stopcontact", "Stoomoven", "Transformator", "USB lader", "Vaatwasmachine", "Ventilator", "Verlenging", "Verwarmingstoestel", "Vrije tekst", "Wasmachine", "Zonnepaneel", "---", "Aansluitpunt", "Aftakdoos", "Leeg"];
          //this.consumers = [""];
          break;
        }
      }
    }
  }

  //-- Make the current item a copy of source_item --

  clone(source_item: List_Item) {
    this.parent = source_item.parent;
    this.indent = source_item.indent;
    this.collapsed = source_item.collapsed;
    this.Parent_Item = source_item.Parent_Item;
    for (var i = 0; i<this.keys.length; i++) {
      for (var j=0; j<3; j++) {
        this.keys[i][j] = source_item.keys[i][j];
      }
    }
    for (i = 0; i<this.consumers.length; i++) {
      this.consumers[i] = (source_item as Electro_Item).consumers[i];
    }
  }

  //-- When a new element is created, we will call resetKeys to set the keys to their default values --

  resetKeys() {
    this.keys[1][2] = true;
    this.keys[2][2] = true;
    this.keys[3][2] = false;
    this.keys[5][2] = "enkelpolig";
    this.keys[6][2] = false;
    if (this.keys[0][2] == "Aansluiting") {
      this.keys[4][2] = "2";
      this.keys[7][2] = "differentieel";
      this.keys[8][2] = "40";
      this.keys[9][2] = "2x16";
      this.keys[17][2] = "";
    } else {
      this.keys[4][2] = "1";
      this.keys[7][2] = "automatisch";
      this.keys[8][2] = "20";
      this.keys[9][2] = "XVB 3G2,5";
    };
    if (this.keys[0][2] == "Verlenging") {
      this.keys[22][2] = 40;
    };
    if (this.keys[0][2] == "Vrije tekst") {
      this.keys[22][2] = 40;
      this.keys[17][2] = "centreer";
    };
    this.keys[11][2] = "300"; //Differentieel
    if (this.Parent_Item == null) {
      this.keys[12][2] = true;
    } else {
      switch (this.Parent_Item.getKey("type")) { //Kabel_aanwezig
        case "Splitsing":
          this.keys[7][2] = "geen"; //geen zekering per default na splitsing
          this.keys[12][2] = false; //geen kabel per default na splitsing
          break;
        case "Domotica":
          this.keys[7][2] = "geen"; //geen zekering per default na domotica
          break;
        default:
          this.keys[7][2] = "automatisch"; //wel een zekering na bord
          this.keys[12][2] = true; //wel een kabel na bord
          break;
      }
    };
    if (this.keys[0][2] == "Schakelaars") {this.keys[25][2] = false; }
    this.keys[13][2] = "1";
    this.keys[14][2] = "230V/24V";
    this.keys[15][2] = "";
    //-- Set each of the optional booleans to false --
    this.keys[19][2] = false;
    this.keys[20][2] = false;
    this.keys[21][2] = false;
    switch (this.keys[0][2]) { //Special cases
      case "Kring":
        this.keys[4][2] = 2;
        this.keys[10][2] = "---";
        this.keys[16][2] = "N/A";
        this.keys[17][2] = "";
        break;
      case "Stopcontact":
        this.keys[16][2] = "3";
        break;
      case "Splitsing":
        //this.keys[10][2] = "";
        break;
      case "Domotica":
        this.keys[15][2] = "Domotica";
        break;
      case "Lichtpunt":
        this.keys[17][2] = "Geen"; //Geen noodverlichting
        break;
      default:
        //this.keys[10][2] = "";
        break;
    };
  }

  //-- Algorithm to manually set a key, but most of the time, the keys-array is updated directly
  //   Note that getKey is defined in List_Item --

  setKey(key: string, setvalue: any) {
    super.setKey(key, setvalue);
    //If type of component changed, reset everything
    if (key=="type") {
      this.resetKeys();
    }
    //Some validation on the input. Do properties still make sense after update
    switch (this.keys[0][2]) {
      case "Lichtcircuit":
        if (this.getKey("lichtkring_poligheid") == "dubbelpolig") {
          if ((this.getKey("aantal") as Number) > 2) {
            this.setKey("aantal","2");
          }
        }
        break;
      case "Verwarmingstoestel":
        if ( (this.getKey("accumulatie") == false) && (this.getKey("ventilator") == true) ) {
          this.setKey("ventilator",false);
        }
        break;
      case "Kring":
        if ( ( (this.getKey("aantal") as Number) < 1 ) || ( (this.getKey("aantal") as Number) > 4 ) ) {
          this.setKey("aantal","2");
        }
        break;
    }
  }

  //-- Returns true if the Electro_Item can have childs in case it is or
  //   will become a child of Parent --

  checkInsertChild(Parent?: List_Item) { //Checks if the insert after button should be displayed or not
    var allow = false;
    switch (this.keys[0][2]) {
      case "Aansluiting":
      case "Bord":
      case "Kring":
      case "Domotica":
      case "Splitsing":
        allow = true;
        break;
      case "Bel":
      case "Lichtcircuit":
        allow = false;
        break;
      default:
        if (typeof Parent == 'undefined') {
          allow = true;
        } else {
          switch(Parent.keys[0][2]) {
            case "Aansluiting":
            case "Bord":
            case "Domotica":
            case "Splitsing":
            case "Meerdere verbruikers":
              allow = false;
              break;
            default:
              allow = true;
              break;
          }
        }
    }
    return(allow);
  }

  //-- returns the maximum number of childs the current Electro_Item can have in case
  //   it is or will become a child of Parent --

  getMaxNumChilds(Parent?: List_Item) {
    var maxchilds = 0;
    switch (this.keys[0][2]) {
      case "Aansluiting":
      case "Bord":
      case "Kring":
      case "Domotica":
      case "Splitsing":
      case "Meerdere verbruikers":
        maxchilds = 256;
        break;
      case "Bel":
      case "Lichtcircuit":
        maxchilds = 0;
        break;
      default:
        if (typeof Parent == 'undefined') {
          maxchilds = 256;
        } else {
          switch(Parent.keys[0][2]) {
            case "Aansluiting":
            case "Bord":
            case "Domotica":
            case "Splitsing":
            case "Meerdere verbruikers":
              maxchilds = 0;
              break;
            default:
              maxchilds = 1;
              break;
          }
        }
    }
    return(maxchilds);
  }

  //-- Checks if the insert after button should be displayed or not in case the
  //   element is or will become a child of Parent --

  checkInsertAfter(Parent?: List_Item) {
    var allow = false;
    if (typeof Parent == 'undefined') {
      allow = true;
    } else {
      //alert(Parent.keys[0][2]);
      switch(Parent.keys[0][2]) {
        case "Aansluiting":
        case "Bord":
        case "Kring":
        case "Domotica":
        case "Splitsing":
        case "Meerdere verbruikers":
          allow = true;
          break;
        default:
          allow = false;
          break;
      }
    }
    return(allow);
  }

  //-- Display the element in the editing grid at the left of the screen in case the
  //   element is or will become a child of Parent --

  toHTML(mode: string, Parent?: List_Item) {
    let output:string = "";

    if (mode=="move") {
      output += "<b>ID: "+this.id+"</b>, ";
      output += 'Moeder: <input id="id_parent_change_' + this.id + '" type="text" size="2" value="' + this.parent + '" onchange="HL_changeparent(' + this.id + ')"> ';
      output += " <button style=\"background-color:lightblue;\" onclick=\"HLMoveUp(" + this.id +")\">&#9650;</button>";
      output += " <button style=\"background-color:lightblue;\" onclick=\"HLMoveDown(" + this.id +")\">&#9660;</button>";
      if (this.checkInsertAfter(Parent)) {
        output += " <button style=\"background-color:lightblue;\" onclick=\"HLClone(" + this.id +")\">Clone</button>";
      }
    } else {
      if (this.checkInsertAfter(Parent)) {
        output += " <button style=\"background-color:green;\" onclick=\"HLInsertBefore(" + this.id +")\">&#9650;</button>";
        output += " <button style=\"background-color:green;\" onclick=\"HLInsertAfter(" + this.id +")\">&#9660;</button>";
      }
      if (this.checkInsertChild(Parent)) {
        output += " <button style=\"background-color:green;\" onclick=\"HLInsertChild(" + this.id +")\">&#9654;</button>";
      }
    };
    output += " <button style=\"background-color:red;\" onclick=\"HLDelete(" + this.id +")\">&#9851;</button>";
    output += "&nbsp;"

    this.updateConsumers(Parent);
    output += this.selectToHTML(0, this.consumers);

    switch (this.keys[0][2]) {
      case "Kring":
        output += "&nbsp;Naam: " + this.stringToHTML(10,5) + "<br>";
        output += "Zekering: " + this.selectToHTML(7,["automatisch","differentieel","smelt","geen","---","schakelaar","schemer","overspanningsbeveiliging"]);
        if (this.keys[7][2] != "geen") output += this.selectToHTML(4,["2","3","4","-","1"]) + this.stringToHTML(8,2) + "A";
        if (this.getKey("zekering")=="differentieel") {
          output += ", \u0394 " + this.stringToHTML(11,3) + "mA";
          output += ", Type:" + this.selectToHTML(17,["","A","B"]);
          output += ", Selectief: " + this.checkboxToHTML(20);
        }
        output += ", Kabel: " + this.checkboxToHTML(12);
        if (this.getKey("kabel_aanwezig")) {
          output += ", Type: " + this.stringToHTML(9,10);
          output += ", Plaatsing: " + this.selectToHTML(16,["N/A","Ondergronds","Luchtleiding","In wand","Op wand"]);
          if (this.keys[16][2] != "Luchtleiding") {
            output += ", In buis: " + this.checkboxToHTML(19);
          }
        }
        output += ", Tekst: " + this.stringToHTML(15,10);
        break;
      case "Aansluiting":
        output += "&nbsp;";
        if (typeof Parent != 'undefined') output += "Nr: " + this.stringToHTML(10,5) + ", ";
        output += "Zekering: " + this.selectToHTML(7,["automatisch","differentieel","smelt","geen","---","schakelaar","schemer"]) +
                                       this.selectToHTML(4,["2","3","4"]) +
                                       this.stringToHTML(8,2) + "A";
        if (this.getKey("zekering")=="differentieel") {
          output += ", \u0394 " + this.stringToHTML(11,3) + "mA";
          output += ", Type:" + this.selectToHTML(17,["","A","B"]);
          output += ", Selectief: " + this.checkboxToHTML(20);
        }
        output += ", Kabeltype: " + this.stringToHTML(9,10);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Bord":
        output += "&nbsp;Naam: " + this.stringToHTML(10,5) + ", ";
        output += "Geaard: " + this.checkboxToHTML(1);
        break;
      case "Drukknop":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", Type: " + this.selectToHTML(16,["standaard","dimmer","rolluik"]);
        output += ", Verklikkerlampje: " + this.checkboxToHTML(21);
        output += ", Halfwaterdicht: " + this.checkboxToHTML(20);
        output += ", Afgeschermd: " + this.checkboxToHTML(19);
        output += ", Aantal armaturen: " + this.selectToHTML(4,["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"]);
        output += ", Aantal knoppen per armatuur: " + this.selectToHTML(13,["1","2","3","4","5","6","7","8"]);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Stopcontact":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5) + ", ";
        output += "Geaard: " + this.checkboxToHTML(1) + ", ";
        output += "Kinderveiligheid: " + this.checkboxToHTML(2) + " ";
        output += "Halfwaterdicht: " + this.checkboxToHTML(20) + ", ";
        output += "Meerfasig: " + this.checkboxToHTML(21) + ", ";
        if (this.keys[21][2]) {
          output += "Aantal fasen: " + this.selectToHTML(16,["1","2","3"]) + ", ";
          output += "Met nul: " + this.checkboxToHTML(25) + ", ";
        };
        output += "Ingebouwde schakelaar: " + this.checkboxToHTML(19) + ", ";
        output += "Aantal: " + this.selectToHTML(4,["1","2","3","4","5","6"]);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Batterij":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5) + ", ";
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Boiler":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5) + ", ";
        output += "Accumulatie: " + this.checkboxToHTML(3);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Ketel":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", Type: " + this.selectToHTML(16,["", "Met boiler", "Met tapspiraal", "Warmtekrachtkoppeling", "Warmtewisselaar"]);
        output += ", Energiebron: " + this.selectToHTML(17,["", "Elektriciteit", "Gas (atmosferisch)", "Gas (ventilator)", "Vaste brandstof", "Vloeibare brandstof"]);
        output += ", Warmte functie: " + this.selectToHTML(18,["", "Koelend", "Verwarmend", "Verwarmend en koelend"]);
        output += ", Aantal: " + this.selectToHTML(4,["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"]);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Lichtpunt":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5) + ", ";
        output += "Type: " + this.selectToHTML(16,["standaard", "TL", "spot", "led" /*, "Spot", "Led", "Signalisatielamp" */]) + ", ";
        if (this.keys[16][2] == "TL") {
          output += "Aantal buizen: " + this.selectToHTML(13,["1","2","3","4"]) + ", ";
        }
        output += "Aantal lampen: " + this.selectToHTML(4,["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"]) + ", ";
        output += "Wandlamp: " + this.checkboxToHTML(19) + ", ";
        output += "Halfwaterdicht: " + this.checkboxToHTML(20) + ", ";
        output += "Ingebouwde schakelaar: " + this.checkboxToHTML(21) + ", ";
        output += "Noodverlichting: " + this.selectToHTML(17,["Geen", "Centraal", "Decentraal"]);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Lichtcircuit":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", " + this.selectToHTML(5,["enkelpolig", "dubbelpolig", "driepolig", "dubbelaansteking", "---", "schakelaar", "dimschakelaar", "bewegingsschakelaar", "schemerschakelaar", "---", "teleruptor", "relais", "dimmer", "tijdschakelaar", "minuterie", "thermostaat"]);
        output += ", Halfwaterdicht: " + this.checkboxToHTML(20);
        if ( (this.keys[5][2] == "enkelpolig") || (this.keys[5][2] == "dubbelpolig") || (this.keys[5][2] == "driepolig") || (this.keys[5][2] == "kruis_enkel") ||
             (this.keys[5][2] == "dubbelaansteking") || (this.keys[5][2] == "wissel_enkel") || (this.keys[5][2] == "dubbel") ||
             (this.keys[5][2] == "dimschakelaar") ) {
          output += ", Verklikkerlampje: " + this.checkboxToHTML(21);
          output += ", Signalisatielampje: " + this.checkboxToHTML(19);
          if (this.keys[5][2] != "dimschakelaar") {output += ", Trekschakelaar: " + this.checkboxToHTML(25); }
        }
        switch (this.getKey("lichtkring_poligheid")) {
          case "enkelpolig":
            output += ", Aantal schakelaars: " + this.selectToHTML(4,["0","1","2","3","4","5"]);
            break;
          case "dubbelpolig":
            output += ", Aantal schakelaars: " + this.selectToHTML(4,["0","1","2"]);
            break;
        }
        output += ", Aantal lichtpunten: " + this.selectToHTML(13,["0","1","2","3","4","5","6","7","8","9","10"]);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Schakelaars":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", " + this.selectToHTML(5,["enkelpolig", "dubbelpolig", "driepolig", "dubbelaansteking", "wissel_enkel", "wissel_dubbel", "kruis_enkel", "---", "schakelaar", "dimschakelaar", "dimschakelaar wissel", "bewegingsschakelaar", "schemerschakelaar", "---", "teleruptor", "relais", "dimmer", "tijdschakelaar", "minuterie", "thermostaat", "rolluikschakelaar"]);
        if ( (this.keys[5][2] == "enkelpolig") || (this.keys[5][2] == "dubbelpolig") || (this.keys[5][2] == "driepolig") || (this.keys[5][2] == "kruis_enkel") ||
             (this.keys[5][2] == "dubbelaansteking") || (this.keys[5][2] == "wissel_enkel") || (this.keys[5][2] == "wissel_dubbel") || (this.keys[5][2] == "dubbel") ||
             (this.keys[5][2] == "dimschakelaar") || (this.keys[5][2] == "dimschakelaar wissel") || (this.keys[5][2] == "rolluikschakelaar") ) {
          output += ", Halfwaterdicht: " + this.checkboxToHTML(20);
        }
        if ( (this.keys[5][2] == "enkelpolig") || (this.keys[5][2] == "dubbelpolig") || (this.keys[5][2] == "driepolig") || (this.keys[5][2] == "kruis_enkel") ||
             (this.keys[5][2] == "dubbelaansteking") || (this.keys[5][2] == "wissel_enkel") || (this.keys[5][2] == "wissel_dubbel") || (this.keys[5][2] == "dubbel") ||
             (this.keys[5][2] == "dimschakelaar") || (this.keys[5][2] == "dimschakelaar wissel") ) {
          output += ", Verklikkerlampje: " + this.checkboxToHTML(21);
          output += ", Signalisatielampje: " + this.checkboxToHTML(19);
          if ( (this.keys[5][2] != "dimschakelaar") && (this.keys[5][2] != "dimschakelaar wissel") ) {output += ", Trekschakelaar: " + this.checkboxToHTML(25); }
        }
        switch (this.getKey("lichtkring_poligheid")) {
          case "enkelpolig":
            output += ", Aantal schakelaars: " + this.selectToHTML(4,["1","2","3","4","5"]);
            break;
          case "dubbelpolig":
            output += ", Aantal schakelaars: " + this.selectToHTML(4,["1","2"]);
            break;
        }
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Domotica":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", Tekst: " + this.stringToHTML(15,10);
      case "Splitsing":
        break;
      case "Transformator":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", Voltage: " + this.stringToHTML(14,8);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "USB lader":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", Aantal: " + this.selectToHTML(4,["1","2","3","4","5","6","7","8","9","10"]);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Verlenging":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", Breedte: " + this.stringToHTML(22,3);
        output += ", Adres/tekst: " + this.stringToHTML(23,2);
        break;
      case "Verwarmingstoestel":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", Accumulatie: " + this.checkboxToHTML(3);
        if (this.getKey("accumulatie")) {
          output += ", Ventilator: " + this.checkboxToHTML(6);
        }
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Vrije tekst":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", Tekst (nieuwe lijn = \"|\"): " + this.stringToHTML(15,10);
        output += ", Type: " + this.selectToHTML(16,["","verbruiker","zonder kader"]);
        output += ", Horizontale alignering: " + this.selectToHTML(17,["links","centreer","rechts"]);
        output += ", Vet: " + this.checkboxToHTML(19);
        output += ", Schuin: " + this.checkboxToHTML(20);
        output += ", Breedte: " + this.stringToHTML(22,3);
        if (this.keys[16][2] != "zonder kader") output += ", Adres/tekst: " + this.stringToHTML(23,2);
        break;
      case "Zonnepaneel":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5) + ", ";
        output += " Aantal: " + this.selectToHTML(4,["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20",
                                                     "21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40"]);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      case "Meerdere vebruikers":
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
      default:
        output += "&nbsp;Nr: " + this.stringToHTML(10,5);
        output += ", Adres/tekst: " + this.stringToHTML(15,5);
        break;
    }
    //output += "id: " + this.id + " parent: " + this.parent;
    return(output);
  }

  //-- Generates SVG code for switches --

  toSVGswitches(hasChild: Boolean, mySVG: SVGelement) {
    let outputstr:string = "";
    var elements:Array<string> = new Array<string>();
    var halfwaterdicht:Array<boolean> = new Array<boolean>();
    var verklikkerlamp:Array<boolean> = new Array<boolean>();
    var signalisatielamp:Array<boolean> = new Array<boolean>();
    var trekschakelaar:Array<boolean> = new Array<boolean>();

    var lowerbound = 20; // How low does the switch go below the baseline, needed to place adres afterwards

    switch (this.getKey("lichtkring_poligheid")) {
      case "wissel_enkel":
        elements.push("wissel_enkel");
        signalisatielamp.push(this.keys[19][2]);
        halfwaterdicht.push(this.keys[20][2]);
        verklikkerlamp.push(this.keys[21][2]);
        trekschakelaar.push(this.keys[25][2]);
        break;
      case "wissel_dubbel":
        elements.push("wissel_dubbel");
        signalisatielamp.push(this.keys[19][2]);
        halfwaterdicht.push(this.keys[20][2]);
        verklikkerlamp.push(this.keys[21][2]);
        trekschakelaar.push(this.keys[25][2]);
        break;
      case "kruis_enkel":
        elements.push("kruis_enkel");
        signalisatielamp.push(this.keys[19][2]);
        halfwaterdicht.push(this.keys[20][2]);
        verklikkerlamp.push(this.keys[21][2]);
        trekschakelaar.push(this.keys[25][2]);
        break;
      case "teleruptor":
        elements.push("teleruptor");
        signalisatielamp.push(false);
        halfwaterdicht.push(false);
        verklikkerlamp.push(false);
        trekschakelaar.push(false);
        break;
      case "bewegingsschakelaar":
        elements.push("bewegingsschakelaar");
        signalisatielamp.push(false);
        halfwaterdicht.push(false);
        verklikkerlamp.push(false);
        trekschakelaar.push(false);
        break;
      case "schemerschakelaar":
        elements.push("schemerschakelaar");
        signalisatielamp.push(false);
        halfwaterdicht.push(false);
        verklikkerlamp.push(false);
        trekschakelaar.push(false);
        break;
      case "schakelaar":
        elements.push("schakelaar");
        signalisatielamp.push(false);
        halfwaterdicht.push(false);
        verklikkerlamp.push(false);
        trekschakelaar.push(false);
        break;
      case "dimmer":
        elements.push("dimmer");
        signalisatielamp.push(false);
        halfwaterdicht.push(false);
        verklikkerlamp.push(false);
        trekschakelaar.push(false);
        break;
      case "relais":
        elements.push("relais");
        signalisatielamp.push(false);
        halfwaterdicht.push(false);
        verklikkerlamp.push(false);
        trekschakelaar.push(false);
        break;
      case "minuterie":
        elements.push("minuterie");
        signalisatielamp.push(false);
        halfwaterdicht.push(false);
        verklikkerlamp.push(false);
        trekschakelaar.push(false);
        break;
      case "thermostaat":
        elements.push("thermostaat");
        signalisatielamp.push(false);
        halfwaterdicht.push(false);
        verklikkerlamp.push(false);
        trekschakelaar.push(false);
        break;
      case "tijdschakelaar":
        elements.push("tijdschakelaar");
        signalisatielamp.push(false);
        halfwaterdicht.push(false);
        verklikkerlamp.push(false);
        trekschakelaar.push(false);
        break;
      case "rolluikschakelaar":
        elements.push("rolluik");
        signalisatielamp.push(false);
        halfwaterdicht.push(this.keys[20][2]);
        verklikkerlamp.push(false);
        trekschakelaar.push(false);
        break;
      case "dubbelaansteking":
        elements.push("dubbelaansteking");
        signalisatielamp.push(this.keys[19][2]);
        halfwaterdicht.push(this.keys[20][2]);
        verklikkerlamp.push(this.keys[21][2]);
        trekschakelaar.push(this.keys[25][2]);
        break;
      case "dimschakelaar":
        elements.push("dimschakelaar");
        signalisatielamp.push(this.keys[19][2]);
        halfwaterdicht.push(this.keys[20][2]);
        verklikkerlamp.push(this.keys[25][2]);
        trekschakelaar.push(false);
        break;
      case "dimschakelaar wissel":
        elements.push("dimschakelaar wissel");
        signalisatielamp.push(this.keys[19][2]);
        halfwaterdicht.push(this.keys[20][2]);
        verklikkerlamp.push(this.keys[25][2]);
        trekschakelaar.push(false);
        break;
      default: {
        if (this.getKey("aantal") == "0") {
          //do nothing
        } else if (this.getKey("aantal") == "1") {
          if (this.getKey("lichtkring_poligheid") == "enkelpolig") {
            elements.push("enkel");
          } else if (this.getKey("lichtkring_poligheid") == "dubbelpolig") {
            elements.push("dubbel");
          } else if (this.getKey("lichtkring_poligheid") == "driepolig") {
            elements.push("driepolig");
          }
          signalisatielamp.push(this.keys[19][2]);
          halfwaterdicht.push(this.keys[20][2]);
          verklikkerlamp.push(this.keys[21][2]);
          trekschakelaar.push(this.keys[25][2]);
        } else {
          if (this.getKey("lichtkring_poligheid") == "enkelpolig") {
            elements.push("wissel_enkel");
            signalisatielamp.push(this.keys[19][2]);
            halfwaterdicht.push(this.keys[20][2]);
            verklikkerlamp.push(this.keys[21][2]);
            trekschakelaar.push(this.keys[25][2]);
            for (var i=2; i<this.getKey("aantal"); i++) {
              elements.push("kruis_enkel");
              signalisatielamp.push(this.keys[19][2]);
              halfwaterdicht.push(this.keys[20][2]);
              verklikkerlamp.push(this.keys[21][2]);
              trekschakelaar.push(this.keys[25][2]);
            }
            elements.push("wissel_enkel");
            signalisatielamp.push(this.keys[19][2]);
            halfwaterdicht.push(this.keys[20][2]);
            verklikkerlamp.push(this.keys[21][2]);
            trekschakelaar.push(this.keys[25][2]);
          } else if (this.getKey("lichtkring_poligheid") == "dubbelpolig") {
            elements.push("wissel_dubbel");
            signalisatielamp.push(this.keys[19][2]);
            halfwaterdicht.push(this.keys[20][2]);
            verklikkerlamp.push(this.keys[21][2]);
            trekschakelaar.push(this.keys[25][2]);
            elements.push("wissel_dubbel");
            signalisatielamp.push(this.keys[19][2]);
            halfwaterdicht.push(this.keys[20][2]);
            verklikkerlamp.push(this.keys[21][2]);
            trekschakelaar.push(this.keys[25][2]);
          }
        }
      }
    }

    if (this.getKey("aantal2")>=1) {
      elements.push("lamp");
      signalisatielamp.push(this.keys[19][2]);
      halfwaterdicht.push(this.keys[20][2]);
      verklikkerlamp.push(this.keys[21][2]);
    }

    var startx = 1;
    var endx = 0;

    for (i=0; i<elements.length; i++ ) {
      switch (elements[i]) {
        case "enkel":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar_enkel" x="' + endx + '" y="25" />';
          if (signalisatielamp[i]) outputstr += '<use xlink:href="#signalisatielamp" x="' + (endx-10) + '" y="25" />';
          if (halfwaterdicht[i]) outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>';
          if (verklikkerlamp[i]) outputstr += '<line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="22" y2="28" stroke="black" /><line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="28" y2="22" stroke="black" />';
          if (trekschakelaar[i]) outputstr += '<line x1="' + (endx+10.5) + '" x2="' + (endx+10.5) + '" y1="5" y2="15" stroke="black" /><line x1="' + (endx+10.5) + '" x2="' + (endx+8.5) + '" y1="15" y2="11" stroke="black" /><line x1="' + (endx+10.5) + '" x2="' + (endx+12.5) + '" y1="15" y2="11" stroke="black" />';
          startx = endx+5;
          break;
        case "dubbel":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar_dubbel" x="' + endx + '" y="25" />';
          if (signalisatielamp[i]) outputstr += '<use xlink:href="#signalisatielamp" x="' + (endx-10) + '" y="25" />';
          if (halfwaterdicht[i]) { outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>'; }
          if (verklikkerlamp[i]) { outputstr += '<line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="22" y2="28" stroke="black" /><line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="28" y2="22" stroke="black" />'; };
          if (trekschakelaar[i]) outputstr += '<line x1="' + (endx+8.5) + '" x2="' + (endx+8.5) + '" y1="9" y2="19" stroke="black" /><line x1="' + (endx+8.5) + '" x2="' + (endx+6.5) + '" y1="19" y2="15" stroke="black" /><line x1="' + (endx+8.5) + '" x2="' + (endx+10.5) + '" y1="19" y2="15" stroke="black" />';
          startx = endx+5;
          break;
        case "driepolig":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar_trippel" x="' + endx + '" y="25" />';
          if (signalisatielamp[i]) outputstr += '<use xlink:href="#signalisatielamp" x="' + (endx-10) + '" y="25" />';
          if (halfwaterdicht[i]) { outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>'; }
          if (verklikkerlamp[i]) { outputstr += '<line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="22" y2="28" stroke="black" /><line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="28" y2="22" stroke="black" />'; };
          if (trekschakelaar[i]) outputstr += '<line x1="' + (endx+8.5) + '" x2="' + (endx+8.5) + '" y1="9" y2="19" stroke="black" /><line x1="' + (endx+8.5) + '" x2="' + (endx+6.5) + '" y1="19" y2="15" stroke="black" /><line x1="' + (endx+8.5) + '" x2="' + (endx+10.5) + '" y1="19" y2="15" stroke="black" />';
          startx = endx+5;
          break;
        case "dubbelaansteking":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar_dubbelaansteking" x="' + endx + '" y="25" />';
          if (signalisatielamp[i]) outputstr += '<use xlink:href="#signalisatielamp" x="' + (endx-10) + '" y="25" />';
          if (halfwaterdicht[i]) { outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>'; }
          if (verklikkerlamp[i]) { outputstr += '<line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="22" y2="28" stroke="black" /><line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="28" y2="22" stroke="black" />'; };
          if (trekschakelaar[i]) outputstr += '<line x1="' + (endx+10.5) + '" x2="' + (endx+10.5) + '" y1="5" y2="15" stroke="black" /><line x1="' + (endx+10.5) + '" x2="' + (endx+8.5) + '" y1="15" y2="11" stroke="black" /><line x1="' + (endx+10.5) + '" x2="' + (endx+12.5) + '" y1="15" y2="11" stroke="black" />';
          startx = endx+5;
          break;
        case "wissel_enkel":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar_wissel_enkel" x="' + endx + '" y="25" />';
          if (signalisatielamp[i]) outputstr += '<use xlink:href="#signalisatielamp" x="' + (endx-10) + '" y="25" />';
          if (halfwaterdicht[i]) { outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>'; }
          if (verklikkerlamp[i]) { outputstr += '<line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="22" y2="28" stroke="black" /><line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="28" y2="22" stroke="black" />'; };
          if (trekschakelaar[i]) outputstr += '<line x1="' + (endx+10.5) + '" x2="' + (endx+10.5) + '" y1="5" y2="15" stroke="black" /><line x1="' + (endx+10.5) + '" x2="' + (endx+8.5) + '" y1="15" y2="11" stroke="black" /><line x1="' + (endx+10.5) + '" x2="' + (endx+12.5) + '" y1="15" y2="11" stroke="black" />';
          startx = endx+5;
          lowerbound = Math.max(lowerbound,35);
          break;
        case "wissel_dubbel":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar_wissel_dubbel" x="' + endx + '" y="25" />';
          if (signalisatielamp[i]) outputstr += '<use xlink:href="#signalisatielamp" x="' + (endx-10) + '" y="25" />';
          if (halfwaterdicht[i]) { outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>'; }
          if (verklikkerlamp[i]) { outputstr += '<line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="22" y2="28" stroke="black" /><line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="28" y2="22" stroke="black" />'; };
          if (trekschakelaar[i]) outputstr += '<line x1="' + (endx+8.5) + '" x2="' + (endx+8.5) + '" y1="9" y2="19" stroke="black" /><line x1="' + (endx+8.5) + '" x2="' + (endx+6.5) + '" y1="19" y2="15" stroke="black" /><line x1="' + (endx+8.5) + '" x2="' + (endx+10.5) + '" y1="19" y2="15" stroke="black" />';
          startx = endx+5;
          lowerbound = Math.max(lowerbound,35);
          break;
        case "kruis_enkel":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar_kruis_enkel" x="' + endx + '" y="25" />';
          if (signalisatielamp[i]) outputstr += '<use xlink:href="#signalisatielamp" x="' + (endx-10) + '" y="25" />';
          if (halfwaterdicht[i]) { outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>'; }
          if (verklikkerlamp[i]) { outputstr += '<line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="22" y2="28" stroke="black" /><line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="28" y2="22" stroke="black" />'; };
          if (trekschakelaar[i]) outputstr += '<line x1="' + (endx+10.5) + '" x2="' + (endx+10.5) + '" y1="5" y2="15" stroke="black" /><line x1="' + (endx+10.5) + '" x2="' + (endx+8.5) + '" y1="15" y2="11" stroke="black" /><line x1="' + (endx+10.5) + '" x2="' + (endx+12.5) + '" y1="15" y2="11" stroke="black" />';
          startx = endx+5;
          lowerbound = Math.max(lowerbound,35);
          break;
        case "dimschakelaar":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar_enkel_dim" x="' + endx + '" y="25" />';
          if (signalisatielamp[i]) outputstr += '<use xlink:href="#signalisatielamp" x="' + (endx-10) + '" y="25" />';
          if (halfwaterdicht[i]) { outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>'; }
          if (verklikkerlamp[i]) { outputstr += '<line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="22" y2="28" stroke="black" /><line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="28" y2="22" stroke="black" />'; };
          startx = endx+5;
          break;
        case "dimschakelaar wissel":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar_wissel_dim" x="' + endx + '" y="25" />';
          if (signalisatielamp[i]) outputstr += '<use xlink:href="#signalisatielamp" x="' + (endx-10) + '" y="25" />';
          if (halfwaterdicht[i]) { outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>'; }
          if (verklikkerlamp[i]) { outputstr += '<line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="22" y2="28" stroke="black" /><line x1="' + (endx-3) + '" x2="' + (endx+3) + '" y1="28" y2="22" stroke="black" />'; };
          startx = endx+5;
          lowerbound = Math.max(lowerbound,35);
          break;
        case "bewegingsschakelaar":
          endx = startx + 20;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#relais" x="' + endx + '" y="25" />';
          outputstr += '<use xlink:href="#moving_man" x="' + (endx + 1.5) + '" y="20" />';
          startx = endx + 40;
          lowerbound = Math.max(lowerbound,30);
          break;
        case "schakelaar":
          endx = startx + 20;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar" x="' + endx + '" y="25" />';
          startx = endx + 40;
          break;
        case "schemerschakelaar":
          endx = startx + 20;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#schemerschakelaar" x="' + endx + '" y="25" />';
          startx = endx + 40;
          break;
        case "teleruptor":
          endx = startx + 20;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#teleruptor" x="' + endx + '" y="25" />';
          startx = endx + 40;
          lowerbound = Math.max(lowerbound,30);
          break;
        case "dimmer":
          endx = startx + 20;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#dimmer" x="' + endx + '" y="25" />';
          startx = endx + 40;
          lowerbound = Math.max(lowerbound,30);
          break;
        case "relais":
          endx = startx + 20;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#relais" x="' + endx + '" y="25" />';
          startx = endx + 40;
          lowerbound = Math.max(lowerbound,30);
          break;
        case "minuterie":
          endx = startx + 20;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#minuterie" x="' + endx + '" y="25" />';
          startx = endx + 40;
          lowerbound = Math.max(lowerbound,30);
          break;
        case "thermostaat":
          endx = startx + 20;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#thermostaat" x="' + endx + '" y="25" />';
          startx = endx + 40;
          lowerbound = Math.max(lowerbound,30);
          break;
        case "tijdschakelaar":
          endx = startx + 20;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#tijdschakelaar" x="' + endx + '" y="25" />';
          startx = endx + 40;
          lowerbound = Math.max(lowerbound,30);
          break;
        case "rolluik":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#schakelaar_rolluik" x="' + endx + '" y="25" />';
          if (halfwaterdicht[i]) { outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>'; }
          startx = endx + 8;
          lowerbound = Math.max(lowerbound,25);
          break;
        case "lamp":
          endx = startx + 30;
          outputstr += '<line x1="' + startx + '" x2="' + endx + '" y1="25" y2="25" stroke="black" />';
          //outputstr += '<path d="M' + startx + ' 25 L' + endx + ' 25" stroke="black" />';
          outputstr += '<use xlink:href="#lamp" x="' + endx + '" y="25" />';

          var print_str_upper = "";
          if (this.keys[20][2]) {
            print_str_upper = "h";
            if (parseInt(this.keys[13][2]) > 1) { // Meer dan 1 lamp
              print_str_upper += ", x" + this.keys[13][2];
            }
          } else if (parseInt(this.keys[13][2]) > 1) {
            print_str_upper = "x" + this.keys[13][2];
          }

          //if (halfwaterdicht[i]) { outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>'; }

          if (print_str_upper != "") {
            outputstr += '<text x="' + endx + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' + htmlspecialchars(print_str_upper) + '</text>';
          }

          if ( (i<elements.length-1) || ((i==elements.length-1) && (hasChild)) ) {
            outputstr += '<line x1="'+endx+'" y1="25" x2="'+(endx+10)+'" y2="25" stroke="black" />';
          }

          startx = endx + 10;
          lowerbound = Math.max(lowerbound,29);
          break;
      }
    }

    endx = startx-2;
    mySVG.xright = endx;

    //Place adress underneath
    if (!(/^\s*$/.test(this.keys[15][2]))) { //check if adres contains only white space
      outputstr += '<text x="' + ((mySVG.xright-20)/2 + 21) + '" y="' + (25 + lowerbound) + '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-style="italic" font-size="10">' + htmlspecialchars(this.keys[15][2]) + '</text>';
      mySVG.ydown += Math.max(0,lowerbound-20);
    }

    return(outputstr);
  }

  //-- Add the addressline below --

  addAddress(mySVG: SVGelement, starty:number = 60, godown:number = 15, shiftx:number = 0): String {
    let returnstr:string = "";
    if (!(/^\s*$/.test(this.keys[15][2]))) { //check if adres contains only white space
      returnstr = '<text x="' + ((mySVG.xright-20)/2 + 21 + shiftx) + '" y="' + starty + '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-style="italic">' + htmlspecialchars(this.keys[15][2]) + '</text>';
      mySVG.ydown = mySVG.ydown + godown;
    }
    return returnstr;
  }

  //-- Make the SVG for the entire electro item --

  toSVG(hasChild: Boolean = false) {
    let mySVG:SVGelement = new SVGelement();
    let outputstr:string = "";

    mySVG.data = "";
    mySVG.xleft = 1; // foresee at least some space for the conductor
    mySVG.xright = 20;
    mySVG.yup = 25;
    mySVG.ydown = 25;

    switch (this.keys[0][2]) {
      case "Stopcontact":
        var startx: number = 1;
        mySVG.xright = 0;
        if (this.keys[21][2]) { //Meerfasig
          outputstr += '<line x1="1" y1="25" x2="35" y2="25" stroke="black" />';
          startx += 34;
          mySVG.xright += 34;
          switch (this.keys[16][2]) {
            case "1":
              outputstr += '<line x1="21" y1="35" x2="27" y2="15" stroke="black" />';
              break;
            case "2":
              outputstr += '<line x1="16.5" y1="35" x2="22.5" y2="15" stroke="black" />';
              outputstr += '<line x1="22.5" y1="35" x2="28.5" y2="15" stroke="black" />';
              break;
            case "3":
              outputstr += '<line x1="15" y1="35" x2="21" y2="15" stroke="black" />';
              outputstr += '<line x1="21" y1="35" x2="27" y2="15" stroke="black" />';
              outputstr += '<line x1="27" y1="35" x2="33" y2="15" stroke="black" />';
              break;
            default:
              outputstr += '<line x1="21" y1="35" x2="27" y2="15" stroke="black" />';
              break;
          }
          if (this.keys[25][2]) {
            outputstr += '<line x1="39" y1="35" x2="45" y2="15" stroke="black" />';
            outputstr += '<circle cx="39" cy="35" r="2" fill="black" stroke="black" />';
          }
        }
        if (this.keys[19][2]) { //Met ingebouwde schakelaar
          outputstr += '<line x1="' + (startx + 0) + '" y1="25" x2="' + (startx + 11) + '" y2="25" stroke="black" />';
          outputstr += '<line x1="' + (startx + 30) + '" y1="25" x2="' + (startx + 20) + '" y2="5" stroke="black" />';
          outputstr += '<line x1="' + (startx + 20) + '" y1="5" x2="' + (startx + 15) + '" y2="7.5" stroke="black" />';
          outputstr += '<line x1="' + (startx + 22) + '" y1="9" x2="' + (startx + 17) + '" y2="11.5" stroke="black" />';
          startx += 10;
          mySVG.xright += 10;
        }
        for (var i=0; i<this.getKey("aantal"); i++) {
          outputstr += '<use xlink:href="#stopcontact" x="' + startx + '" y="25"></use>';
          if (this.getKey("geaard")) outputstr += '<use xlink:href="#stopcontact_aarding" x="' + startx + '" y="25"></use>';
          if (this.getKey("kinderveiligheid")) outputstr += '<use xlink:href="#stopcontact_kinderveilig" x="' + startx + '" y="25"></use>';
          startx += 20;
        }
        //--check halfwaterdicht--
        if (this.keys[20][2]) outputstr += '<text x="25" y="8" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">h</text>';
        if (hasChild) {
          outputstr += '<line x1="'+startx+'" y1="25" x2="'+(startx+21)+'" y2="25" stroke="black" />';
        };
        mySVG.xright += 20 + this.getKey("aantal")*20;
        //-- Plaats adres onderaan --
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Batterij":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#batterij" x="21" y="25"></use>';
        mySVG.xright = 40+20;
        outputstr += this.addAddress(mySVG,55,10);
        break;
      case "Bel":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#bel" x="21" y="25"></use>';
        mySVG.xright = 40;
        outputstr += this.addAddress(mySVG,58,14);
        break;
      case "Boiler":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        switch (this.getKey("accumulatie")) {
          case false:
            outputstr += '<use xlink:href="#boiler" x="21" y="25"></use>';
            break;
          case true:
            outputstr += '<use xlink:href="#boiler_accu" x="21" y="25"></use>';
            break;
        }
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Diepvriezer":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#diepvriezer" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Droogkast":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#droogkast" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Drukknop":
        var printstr:string = "";
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#drukknop" x="21" y="25"></use>';
        var aantal_knoppen:number = this.getKey("aantal");
        if (this.keys[21][2]) { //met verklikkerlampje
          outputstr += '<line x1="28" y1="20" x2="38" y2="30" stroke="black"></line>'; // midden 33, 25, lengte 7
          outputstr += '<line x1="28" y1="30" x2="38" y2="20" stroke="black"></line>';
        }
        if (this.keys[19][2]) { //afgeschermd
          outputstr += '<line x1="26" y1="10" x2="40" y2="10" stroke="black"></line>'; // midden 33, 25 lengte 7
          outputstr += '<line x1="26" y1="10" x2="26" y2="15" stroke="black"></line>';
          outputstr += '<line x1="40" y1="10" x2="40" y2="15" stroke="black"></line>';
          outputstr += '<line x1="22" y1="15" x2="26" y2="15" stroke="black"></line>';
          outputstr += '<line x1="40" y1="15" x2="44" y2="15" stroke="black"></line>';
        }
        //-- Plaats tekst voor "h" en/of aantal armaturen onderaan --
        if (this.keys[20][2]) printstr += 'h';
        if (aantal_knoppen > 1) {
          if (printstr != '') { printstr += ', ' }
          printstr += 'x' + aantal_knoppen;
        }
        if (printstr != '') outputstr += '<text x="33" y="49" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' + htmlspecialchars(printstr) + '</text>';
        //-- Plaats tekst voor aantal knoppen --
        if (this.keys[13][2] > 1) {
          outputstr += '<text x="44" y="13" style="text-anchor:start" font-family="Arial, Helvetica, sans-serif" font-size="10">' + htmlspecialchars(this.keys[13][2]) + '</text>';
          outputstr += '<line x1="39" y1="19" x2="44" y2="14" stroke="black" />';
        }
        //-- Extra tekens voor rolluik of dimmer --
        switch (this.keys[16][2]) {
          case "dimmer":
            outputstr += '<polygon points="18,20 18,13 28,20" fill="black" stroke="black" />';
            break;
          case "rolluik":
            outputstr += '<polygon points="18,15 22,15 20,12" fill="black" stroke="black" />';
            outputstr += '<polygon points="18,17 22,17 20,20" fill="black" stroke="black" />';
            break;
          default:
        }
        //-- Bereken correcte breedte
        mySVG.xright = 44;
        //-- Plaats adres onderaan --
        if (!(/^\s*$/.test(this.keys[15][2]))) { //check if adres contains only white space
          if (printstr != '') {
            outputstr += '<text x="' + ((mySVG.xright-20)/2 + 21) + '" y="65" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-style="italic">' + htmlspecialchars(this.keys[15][2]) + '</text>';
            mySVG.ydown += 20;
          } else {
            outputstr += '<text x="' + ((mySVG.xright-20)/2 + 21) + '" y="49" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-style="italic">' + htmlspecialchars(this.keys[15][2]) + '</text>';
            mySVG.ydown += 5;
          }
        }
        break;
      case "Elektriciteitsmeter":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#elektriciteitsmeter" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Elektrische oven":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#oven" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "EV lader":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#EVlader" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,58,14);
        break;
      case "Ketel":
        var shifty = 0; if (this.keys[4][2]>1) {
          shifty = 15;
          outputstr += '<text x="41" y="12" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">x' + htmlspecialchars(this.keys[4][2]) + '</text>'
        }
        outputstr += '<line x1="1" y1="' + (shifty+25) + '" x2="21" y2="' + (shifty+25) + '" stroke="black"></line>';
        outputstr += '<use xlink:href="#verbruiker" x="21" y="' + (shifty+25) + '"></use>';
        switch (this.keys[16][2]) {
          case "Met tapspiraal":
            outputstr += '<line x1="21" y1="' + (shifty+15) + '" x2="61" y2="' + (shifty+7) + '" stroke="black" />';
            outputstr += '<line x1="21" y1="' + (shifty+15) + '" x2="61" y2="' + (shifty+23) + '" stroke="black" />';
            break;
          case "Met boiler":
            outputstr += '<rect x="31" y="' + (shifty+10) + '" width="20" height="10" stroke="black" fill="white" />';
            break;
          case "Warmtewisselaar":
            outputstr += '<line x1="26" y1="' + (shifty+0) + '" x2="26" y2="' + (shifty+5) + '" stroke="black" />';
            outputstr += '<line x1="56" y1="' + (shifty+0) + '" x2="56" y2="' + (shifty+5) + '" stroke="black" />';
            outputstr += '<line x1="26" y1="' + (shifty+5) + '" x2="33.5" y2="' + (shifty+23) + '" stroke="black" />';
            outputstr += '<line x1="56" y1="' + (shifty+5) + '" x2="48.5" y2="' + (shifty+23) + '" stroke="black" />';
            outputstr += '<line x1="33.5" y1="' + (shifty+23) + '" x2="41" y2="' + (shifty+14) + '" stroke="black" />';
            outputstr += '<line x1="48.5" y1="' + (shifty+23) + '" x2="41" y2="' + (shifty+14) + '" stroke="black" />';
            break;
          case "Warmtekrachtkoppeling":
            outputstr += '<circle cx="41" cy="' + (shifty+16) + '" r="7" style="stroke:black;fill:none" />';
            outputstr += '<text x="41" y="' + (shifty+17) + '" style="text-anchor:middle;dominant-baseline:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">G</text>'
            break;
        }
        //Waar gaan we de andere symbolen plaatsen, indien slechts 1, midden onderaan, zoniet links en rechts
        var shift_symbol_energiebron = 41;
        var shift_symbol_warmtefunctie = 41;
        if ((this.keys[17][2] != "") && (this.keys[18][2] != "")) {
          var shift_symbol_energiebron = 31;
          var shift_symbol_warmtefunctie = 51;
        }
        switch (this.keys[17][2]) {
          case "Gas (ventilator)":
            outputstr += '<use xlink:href="#gas_ventilator" x="' + (shift_symbol_energiebron) + '" y="' + (shifty+35) + '"/>';
            break;
          case "Gas (atmosferisch)":
            outputstr += '<use xlink:href="#gas_atmosferisch" x="' + (shift_symbol_energiebron) + '" y="' + (shifty+35) + '"/>';
            break;
          case "Elektriciteit":
            outputstr += '<use xlink:href="#bliksem" x="' + (shift_symbol_energiebron) + '" y="' + (shifty+35) + '"/>';
            break;
          case "Vaste brandstof":
            outputstr += '<rect x="' + (shift_symbol_energiebron-6) + '" y="' + (shifty+29) + '" width="12" height="12" style="stroke:black;fill:black" />';
            break;
          case "Vloeibare brandstof":
            outputstr += '<circle cx="' + (shift_symbol_energiebron) + '" cy="' + (shifty+35) + '" r="6" style="stroke:black;fill:black" />';
            break;
        }
        switch (this.keys[18][2]) {
          case "Verwarmend":
            outputstr += '<text x="' + (shift_symbol_warmtefunctie-1) + '" y="' + (shifty+36) + '" style="text-anchor:middle;dominant-baseline:middle" font-family="Arial, Helvetica, sans-serif" font-size="12">+</text>'
            break;
          case "Koelend":
            outputstr += '<text x="' + (shift_symbol_warmtefunctie-1) + '" y="' + (shifty+36) + '" style="text-anchor:middle;dominant-baseline:middle" font-family="Arial, Helvetica, sans-serif" font-size="12">-</text>'
            break;
          case "Verwarmend en koelend":
            outputstr += '<text x="' + (shift_symbol_warmtefunctie-1) + '" y="' + (shifty+36) + '" style="text-anchor:middle;dominant-baseline:middle" font-family="Arial, Helvetica, sans-serif" font-size="12">+/-</text>'
            break;
        }
        mySVG.xright = 60;
        mySVG.yup += shifty;
        //Place adres underneath
        outputstr += this.addAddress(mySVG,shifty+60,15);
        break;
      case "Koelkast":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#koelkast" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Kookfornuis":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#kookfornuis" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Microgolfoven":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#microgolf" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Motor":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#motor" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Omvormer":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#omvormer" x="21" y="25"></use>';
        mySVG.xright = 80;
        outputstr += this.addAddress(mySVG,55,10);
        break;
      case "Overspanningsbeveiliging":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#overspanningsbeveiliging" x="21" y="25"></use>';
        mySVG.xright = 35;
        outputstr += this.addAddress(mySVG,55,10);
        break;
      case "Leeg":
      case "Aansluitpunt":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#aansluitpunt" x="21" y="25"></use>';
        mySVG.xright = 29;
        outputstr += this.addAddress(mySVG,45,0);
        break;
      case "Aftakdoos":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#aftakdoos" x="21" y="25"></use>';
        mySVG.xright = 49;
        outputstr += this.addAddress(mySVG,55,10);
        break;
      case "Lichtcircuit":
        outputstr += this.toSVGswitches(hasChild, mySVG);
        break;
      case "Lichtpunt":
        outputstr += '<line x1="0" x2="30" y1="25" y2="25" stroke="black" />';
        var print_str_upper = "";
        if (this.keys[20][2]) {
          print_str_upper = "h";
          if (parseInt(this.keys[4][2]) > 1) { // Meer dan 1 lamp
            print_str_upper += ", x" + this.keys[4][2];
          }
        } else if (parseInt(this.keys[4][2]) > 1) {
          print_str_upper = "x" + this.keys[4][2];
        }
        switch (this.keys[16][2]) {
          case "led":
            outputstr += '<use xlink:href="#led" x="' + 30 + '" y="25" />';

            if (this.keys[19][2]) {
              outputstr += '<line x1="30" y1="35" x2="42" y2="35" stroke="black" />';
            }
            //determine positioning of emergency symbol and draw it
            var noodxpos;
            var textxpos;
            if (print_str_upper == "") {
              noodxpos = 36;
              textxpos = 36; // not used
            } else {
              noodxpos = 20;
              if ( (print_str_upper.length > 2) && ( (this.keys[17][2] == "Centraal") || (this.keys[17][2] == "Decentraal") ) ) {
                textxpos = 40;
              } else {
                textxpos = 36;
              }
            };
            if (print_str_upper != "") {
              outputstr += '<text x="' + textxpos + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="7">' + htmlspecialchars(print_str_upper) + '</text>';
            }
            if (this.keys[21][2]) {
              outputstr += '<line x1="42" y1="25" x2="45.75" y2="17.5" stroke="black" />';
              outputstr += '<line x1="45.75" y1="17.5" x2="48.25" y2="18.75" stroke="black" />';
            }
            var noodypos = 6.5;
            switch (this.keys[17][2]) {
              case "Centraal":
                outputstr += '<circle cx="' + noodxpos + '" cy="' + noodypos + '" r="2.5" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos-5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos+5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos+5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos-5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                break;
              case "Decentraal":
                outputstr += '<rect x="' + (noodxpos-5.6) + '" y="' + (noodypos-5.6) + '" width="11.2" height="11.2" fill="white" stroke="black" />'
                outputstr += '<circle cx="' + noodxpos + '" cy="' + noodypos + '" r="2.5" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos-5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos+5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos+5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos-5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                break;
              default:
                break;
            }
            mySVG.xright = 42;
            //-- Plaats adres onderaan --
            outputstr += this.addAddress(mySVG,50,5,2);
            break;
          case "spot":
            outputstr += '<use xlink:href="#spot" x="' + 30 + '" y="25" />';

            if (this.keys[19][2]) {
              outputstr += '<line x1="30" y1="38" x2="46" y2="38" stroke="black" />';
            }
            //determine positioning of emergency symbol and draw it
            var noodxpos;
            var textxpos;
            if (print_str_upper == "") {
              noodxpos = 40;
              textxpos = 40; // not used
            } else {
              noodxpos = 24;
              if ( (print_str_upper.length > 2) && ( (this.keys[17][2] == "Centraal") || (this.keys[17][2] == "Decentraal") ) ) {
                textxpos = 44;
              } else {
                textxpos = 40;
              }
            };
            if (print_str_upper != "") {
              outputstr += '<text x="' + textxpos + '" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="7">' + htmlspecialchars(print_str_upper) + '</text>';
            }
            if (this.keys[21][2]) {
              outputstr += '<line x1="46" y1="25" x2="49.75" y2="17.5" stroke="black" />';
              outputstr += '<line x1="49.75" y1="17.5" x2="52.25" y2="18.75" stroke="black" />';
            }
            var noodypos = 6.5;
            switch (this.keys[17][2]) {
              case "Centraal":
                outputstr += '<circle cx="' + noodxpos + '" cy="' + noodypos + '" r="2.5" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos-5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos+5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos+5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos-5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                break;
              case "Decentraal":
                outputstr += '<rect x="' + (noodxpos-5.6) + '" y="' + (noodypos-5.6) + '" width="11.2" height="11.2" fill="white" stroke="black" />'
                outputstr += '<circle cx="' + noodxpos + '" cy="' + noodypos + '" r="2.5" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos-5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos+5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos+5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos-5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                break;
              default:
                break;
            }
            mySVG.xright = 45;
            //-- Plaats adres onderaan --
            outputstr += this.addAddress(mySVG,52,7,4);
            break;
          case "TL":
            var aantal_buizen = this.keys[13][2];
            var starty = 25-(aantal_buizen)*3.5;
            var endy = 25+(aantal_buizen)*3.5;
            outputstr += '<line x1="30" y1="' + starty + '" x2="30" y2="' + endy + '" stroke="black" stroke-width="2" />';
            outputstr += '<line x1="90" y1="' + starty + '" x2="90" y2="' + endy + '" stroke="black" stroke-width="2" />';
            for (var i = 0; i < aantal_buizen ; i++) {
              outputstr += '<line x1="30" y1="' + (starty + (i*7) + 3.5) + '" x2="90" y2="' + (starty + (i*7) + 3.5) + '" stroke="black" stroke-width="2" />';
            }
            if (this.keys[19][2]) {
              outputstr += '<line x1="50" y1="' + (27 + (aantal_buizen*3.5)) + '" x2="70" y2="' + (27 + (aantal_buizen*3.5)) + '" stroke="black" />';
            }
            if (print_str_upper != "") {
              outputstr += '<text x="60" y="' + (25 - (aantal_buizen*3.5)) + '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' + htmlspecialchars(print_str_upper) + '</text>';
            }
            if (this.keys[21][2]) {
              outputstr += '<line x1="77.5" y1="' + (29-(aantal_buizen*3.5)) + '" x2="85" y2="' + (14-(aantal_buizen*3.5)) + '" stroke="black" />';
              outputstr += '<line x1="85" y1="' + (14-(aantal_buizen*3.5)) + '" x2="90" y2="' + (16.5-(aantal_buizen*3.5)) + '" stroke="black" />';
            }
            //determine positioning of emergency symbol and draw it
            var noodxpos;
            if (print_str_upper == "") {noodxpos = 60} else {noodxpos = 39};
            var noodypos = (25 - (aantal_buizen*3.5) - 5);
            switch (this.keys[17][2]) {
              case "Centraal":
                outputstr += '<circle cx="' + noodxpos + '" cy="' + noodypos + '" r="2.5" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos-5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos+5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos+5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos-5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                break;
              case "Decentraal":
                outputstr += '<rect x="' + (noodxpos-5.6) + '" y="' + (noodypos-5.6) + '" width="11.2" height="11.2" fill="white" stroke="black" />'
                outputstr += '<circle cx="' + noodxpos + '" cy="' + noodypos + '" r="2.5" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos-5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos+5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                outputstr += '<line x1="' + (noodxpos+5.6) + '" y1="' + (noodypos-5.6) + '" x2="' + (noodxpos-5.6) + '" y2="' + (noodypos+5.6) + '" style="stroke:black;fill:black" />';
                break;
            }
            mySVG.xright = 90;
            //-- Plaats adres onderaan --
            outputstr += this.addAddress(mySVG,endy+13,Math.max(mySVG.ydown,endy+18-25),2);
            break;
          default:
            switch (this.keys[17][2]) {
              case "Centraal":
                outputstr += '<use xlink:href="#lamp" x="' + 30 + '" y="25" />';
                outputstr += '<circle cx="30" cy="25" r="5" style="stroke:black;fill:black" />';
                if ( hasChild ) {
                  outputstr += '<line x1="'+30+'" y1="25" x2="'+(30+11)+'" y2="25" stroke="black" />';
                }
                break;
              case "Decentraal":
                outputstr += '<use xlink:href="#noodlamp_decentraal" x="' + 30 + '" y="25" />';
                if (this.keys[21][2]) { //Ingebouwde schakelaar
                  outputstr += '<line x1="37" y1="18" x2="40" y2="15" stroke="black" stroke-width="2" />';
                }
                break;
              default:
                outputstr += '<use xlink:href="#lamp" x="' + 30 + '" y="25" />';
                if ( hasChild ) {
                  outputstr += '<line x1="'+30+'" y1="25" x2="'+(30+11)+'" y2="25" stroke="black" />';
                }
                break;
            }
            if (print_str_upper != "") {
              outputstr += '<text x="30" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' + htmlspecialchars(print_str_upper) + '</text>';
            }
            if (this.keys[19][2]) {
              outputstr += '<line x1="20" y1="40" x2="40" y2="40" stroke="black" />';
            }
            if (this.keys[21][2]) {
              outputstr += '<line x1="40" y1="15" x2="45" y2="20" stroke="black" stroke-width="2" />';
            }
            mySVG.xright = 39;
            //-- Plaats adres onderaan --
            outputstr += this.addAddress(mySVG,54,10,-1);
            break;
        }
        break;
      case "Schakelaars":
        this.setKey("aantal2", 0);
        outputstr += this.toSVGswitches(hasChild, mySVG);
        break;
      case "Stoomoven":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#stoomoven" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Transformator":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#transformator" x="21" y="25"></use>';
        outputstr += '<text x="35" y="44" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
          htmlspecialchars(this.getKey("voltage")) + "</text>";
        mySVG.xright = 48;
        outputstr += this.addAddress(mySVG,58,15);
        break;
      case "USB lader":
        var shifty = 0; if (this.keys[4][2]>1) {
          shifty = 12;
          outputstr += '<text x="51" y="14" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">x' + htmlspecialchars(this.keys[4][2]) + '</text>'
        }
        outputstr += '<line x1="1" y1="' + (shifty+25) + '" x2="21" y2="' + (shifty+25) + '" stroke="black"></line>';
        outputstr += '<use xlink:href="#usblader" x="21" y="' + (shifty+25) + '"></use>';
        mySVG.xright = 80;
        outputstr += this.addAddress(mySVG,shifty + 55,10);
        mySVG.yup += shifty;
        break;
      case "Vaatwasmachine":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#vaatwasmachine" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Ventilator":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#ventilator" x="21" y="25"></use>';
        mySVG.xright = 50;
        outputstr += this.addAddress(mySVG,55,10);
        break;
      case "Verwarmingstoestel":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        mySVG.xright = 70;
        switch (this.getKey("accumulatie")) {
          case false:
            outputstr += '<use xlink:href="#verwarmingstoestel" x="21" y="25"></use>';
            break;
          case true:
            switch (this.getKey("ventilator")) {
              case false:
                outputstr += '<use xlink:href="#verwarmingstoestel_accu" x="21" y="25"></use>';
                break;
              case true:
                outputstr += '<use xlink:href="#verwarmingstoestel_accu_ventilator" x="21" y="25"></use>';
                mySVG.xright = 95;
                break;
            }
          break;
        }
        outputstr += this.addAddress(mySVG,55,10);
        break;
      case "Verlenging":
        var width;
        if (isNaN(Number(this.keys[22][2]))) {
          width = 40;
        } else {
          if (Number(this.keys[22][2] == "")) {
            width = 40;
          } else {
            width = Math.max(Number(this.keys[22][2])*1,0);
          }
        }
        mySVG.xright = width-1;

        outputstr += '<line x1="1" y1="25" x2="' + (width+1) + '" y2="25" stroke="black" />';

        //outputstr += this.addAddress(mySVG,40,0,(width - mySVG.xright - 20)/2);
        if (!(/^\s*$/.test(this.keys[23][2]))) { //check if adres contains only white space
          outputstr += '<text x="' + (1 + width/2) + '" y="40" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-style="italic">' + htmlspecialchars(this.keys[23][2]) + '</text>';
        }

        break;


      case "Vrije tekst":
        var width;
        if (isNaN(Number(this.keys[22][2]))) {
          width = 40;
        } else {
          if (Number(this.keys[22][2] == "")) {
            width = 40;
          } else {
            width = Math.max(Number(this.keys[22][2])*1,1);
          }
        }

        var options:string = "";
        if (this.keys[19][2]) options += ' font-weight="bold"';
        if (this.keys[20][2]) options += ' font-style="italic"';



        //--Tekst plaatsen --
        var strlines = htmlspecialchars(this.getKey("commentaar")).split("|");
        switch (this.keys[17][2]) {
          case "links":
            var outputstr_common = '<text style="text-anchor:start" font-family="Arial, Helvetica, sans-serif" font-size="10" x="' + (20 + 5) + '" ';
            for (i = 0; i<strlines.length; i++) {
              var dispy = 28 - 7.5 * Math.min(1,strlines.length-1) + 15 * i;
              outputstr += outputstr_common + ' y="' + dispy + '"' + options + '>' + strlines[i] + '</text>';
            }
            mySVG.xright = 20 + width;
            break;
          case "rechts":
            var outputstr_common = '<text style="text-anchor:end" font-family="Arial, Helvetica, sans-serif" font-size="10" x="' + (20 + width - 4) + '" ';
            for (i = 0; i<strlines.length; i++) {
              var dispy = 28 - 7.5 * Math.min(1,strlines.length-1) + 15 * i;
              outputstr += outputstr_common + ' y="' + dispy + '"' + options + '>' + strlines[i] + '</text>';
            }
            mySVG.xright = 20 + width;
            break;
          default:
            var outputstr_common = '<text style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" x="' + (21 + width/2) + '" ';
            for (i = 0; i<strlines.length; i++) {
              var dispy = 28 - 7.5 * Math.min(1,strlines.length-1) + 15 * i;
              outputstr += outputstr_common + ' y="' + dispy + '"' + options + '>' + strlines[i] + '</text>';
            }
            mySVG.xright = 20 + width;
            break;
        }

        //--Extra plaats voorzien als nodig
        var extraplace = 15 * Math.max(strlines.length-2,0);
        mySVG.yup += extraplace / 2.0;
        mySVG.ydown += extraplace / 2.0;

        //-- Kader en adres tekenen --
        switch (this.keys[16][2]) {
          case "zonder kader":
            break;
          default:
            outputstr += '<line x1="1" y1="' + (25 + extraplace/2.0) + '" x2="21" y2="' + (25 + extraplace/2.0) + '" stroke="black" />';
            outputstr += '<rect x="21" y="5" width="' + width + '" height="' + (40 + extraplace) + '" fill="none" style="stroke:black" />';
            if (!(/^\s*$/.test(this.keys[23][2]))) { //check if adres contains only white space
              outputstr += '<text x="' + (21 + width/2) + '" y="' + (60 + extraplace) + '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-style="italic">' + htmlspecialchars(this.keys[23][2]) + '</text>';
              mySVG.ydown += 15;
            }
            break;
        }

        break;
      case "Wasmachine":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#wasmachine" x="21" y="25"></use>';
        mySVG.xright = 60;
        outputstr += this.addAddress(mySVG,60,15);
        break;
      case "Zonnepaneel":
        outputstr += '<line x1="1" y1="25" x2="21" y2="25" stroke="black"></line>';
        outputstr += '<use xlink:href="#zonnepaneel" x="21" y="25"></use>';
        outputstr += '<text x="60" y="9" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' + htmlspecialchars(this.keys[4][2]) + 'x</text>';
        mySVG.xright = 100;
        outputstr += this.addAddress(mySVG,60,15);
        break;
    }
    mySVG.data = outputstr + "\n";
    return(mySVG);
  }
}
class Simple_Item extends List_Item {
  constructor() {
    super();
    this.keys.push(["name","STRING","no_name"]);
  }

  toHTML() {
    let output:string = "";
    for (var i=0; i<this.keys.length; i++) {
      switch(this.keys[i][1]) {
        case "STRING": {
          output += this.keys[i][0] + ": ";
          var myId = "HL_edit_"+this.id+"_"+this.keys[i][0];
          output += "<input id=\""+myId+"\" type=\"Text\" value=\""+this.keys[i][2]+"\" onchange=HLUpdate("+this.id+",\""+this.keys[i][0]+"\",\""+myId+"\")>";
          break;
        }
      }
    }
    //output += " <input id=\"HL_name_"+this.id+"\" type=\"Text\" value=\""+this.name+"\" onchange=\"HLChangeName("+this.id+")\">";
    output += " <button onclick=\"HLInsertBefore(" + this.id +")\">InsertBefore</button>";
    output += " <button onclick=\"HLDelete(" + this.id +")\">Delete</button>";
    output += " <button onclick=\"HLInsertAfter(" + this.id +")\">Insert After</button>";
    output += "id: " + this.id + " parent: " + this.parent;
    return(output);
  }
}
class Properties {
  filename: string;
  owner: string;
  installer: string;
  info: string;

  constructor() {
    this.filename = "eendraadschema.eds";
    this.owner = "Voornaam Achternaam<br>Straat 0<br>0000 gemeente<br>Tel: +32 00 00 00 00<br>GSM: +32 000 00 00 00<br>e-mail: voornaam.achternaam@domein.be";;
    this.installer = "idem";
    this.info = "getekend met<br>https://www.eendraadschema.goethals-jacobs.be";
  };

  setFilename(name) {
    this.filename = name;
  }
}
/*****************************************************************************
  CLASS Hierarchival_List

  Defines a list with a parent-child relationship.

  FUNCTIONS:
    Constructor()
      makes an empty list
    deleteInactive()
      remove all inactive members from the array. This saves memory
    reSort()
      Internal function. Usually does not need external calling.
      Make sure parent's are always earlier in the array than child.
      Re-arranges the array if needed. Always run reSort after
      having moved around stuff in the array. reSort will also
      remove inactive members from the array.
    getOrdinalById(my_id: number) : number
      Returns the element in the array for a given ID
    getNumChilds(parent_id: number) : number
      Returns the number of childs for a given parent ID
    getMaxNumChilds(parent_id: number) : number
      Returns the maximum number of permissible childs for a given parent ID
      Calls the getMaxNumChilds function of the underlying data element
    addItem(my_item: List_Item)
      Add an item to the end of the list with parent=0 (root)
    insertItemBeforeId(my_item: List_Item, my_id: number)
      Add an item before element with ID my_id having the same parent as my_id
    insertItemAfterId(my_item: List_Item, my_id: number)
      Add an item after element with ID my_id having the same parent as my_id
    insertChildAfterId(my_item: List_Item, my_id: number)
      Add an item after element with ID my_id and make it a child of
      this element.
    moveUp(my_id: number)
      Move element with ID my_id one place up but remain below the parent.
    moveDown(my_id: number)
      Move element with ID my_id one place down but remain below the parent.
    deleteById(my_id: number)
      Remove element with ID my_id and remove all its childs.
    toHTML()
      Outputs the hierarchical list in HTML format. Uses the toHTML function
      of the list item
    toSVG()
      Outputs the hierarchival list in SVG format. Uses the toSVG function
      of the list item

 VARIABLES:
   data: Array<List_Item>;
     Array of list items.
     Stores some standard elements such as parent
   active: Array<Boolean>;
     If an element is deleted, it is first made "inactive" and only then
     deleted when reSort() is called, usually at the end of functions
     that manipulate the array.
   id: Array<number>;
     Array with the official ID's
   properties: Properties;
     Specific properties of the item such as the filename
   length: number;
     Physical length of the array
   curid: number;
     When a new element is inserted, this is the ID it will get. This is NOT
     the same as the phsyical length of the array as the ID keeps on counting
     all once created and deleted members.
   mode: string;
     Mode can be "edit" or "move" depending on whether the interface is set
     to editing a hierarchival list of moving items around.

 *****************************************************************************/

class Hierarchical_List {
  data: Array<List_Item>;
  active: Array<Boolean>;
  id: Array<number>;
  properties: Properties;
  length: number;
  curid: number;
  mode: string; //can be "edit" or "move"

  //-----------------------------------------------------

  constructor() {
    this.length = 0;
    this.data = new Array<List_Item>();
    this.active = new Array<Boolean>();
    this.id = new Array<number>();
    this.properties = new Properties();
    this.curid = 1;
    this.mode = "edit";
  };

  //-----------------------------------------------------

  deleteInactive() {
    for (var i = 0; i<this.length; i++) { //Loop over all items
      while ( (!this.active[i]) && (i<this.length) ) {
        this.data.splice(i,1);
        this.active.splice(i,1);
        this.id.splice(i,1);
        this.length--;
      }
    }
  }

  //-----------------------------------------------------

  reSort() {
    this.deleteInactive();
    var continue_looping = true;
    while (continue_looping) {
      continue_looping = false
      for (var i = 0; i<this.length; i++) { //Loop over all items
        if (this.active[i]) { //We only do something for active members
          var parentOrdinal = this.getOrdinalById(this.data[i].parent);
          if (parentOrdinal > i) { //This shouldn't happen
            //We will need another pass to ensure we had them all
            continue_looping = true;
            //Repush data to the end
            this.data.push(this.data[i]);
            this.active.push(true);
            this.id.push(this.id[i]);
            this.length += 1
            //Set the original element to inactive
            this.active[i] = false;
          }
        }
      }
    }
    this.deleteInactive();
  }

  //-----------------------------------------------------

  getOrdinalById(my_id: number) : number {
    for (var i = 0; i<this.length; i++) {
      if (this.id[i]==my_id) {
        return(i);
      }
    }
  }

  //-----------------------------------------------------

  getNumChilds(parent_id: number) : number {
    var returnval = 0;
    for (var i = 0; i<this.length; i++) {
      if ( (this.data[i].parent == parent_id) && (this.active[i]) ) {
        returnval++;
      }
    }
    return(returnval);
  }

  //-----------------------------------------------------

  getMaxNumChilds(parent_id: number) : number {
    var newparentitem = this.data[this.getOrdinalById(parent_id)];
    var newparentofparentid = this.data[this.getOrdinalById(parent_id)].parent;
    var newparentofparentitem = this.data[this.getOrdinalById(newparentofparentid)];

    var returnval:number = newparentitem.getMaxNumChilds(newparentofparentitem);

    return(returnval);
  }

  //-----------------------------------------------------

  addItem(my_item: List_Item) {
    //First set the correct identifyer
    my_item.id = this.curid;
    my_item.parent = 0;
    my_item.indent = 0;

    //Then push the data into the queue
    this.data.push(my_item);
    this.active.push(true);
    this.id.push(this.curid);

    //Adjust length of the queue and future identifyer
    this.curid += 1;
    this.length += 1;
  }

  //-----------------------------------------------------

  insertItemBeforeId(my_item: List_Item, my_id: number) {
    for (var i = 0; i<this.length; i++) {
      if (this.id[i]==my_id) {
        //First set the correct identifyer
        my_item.id = this.curid;
        my_item.parent = this.data[i].parent;
        my_item.indent = this.data[i].indent;
        my_item.Parent_Item = this.data[this.getOrdinalById(my_item.parent)];
        my_item.collapsed = false;

        //Insert the data
        this.data.splice(i,0,my_item);
        this.active.splice(i,0,true);
        this.id.splice(i,0,this.curid);

        //Adjust length of the queue and future identifyer
        this.curid += 1;
        this.length += 1;

        break;
      }
    }
    this.reSort();
  }

  //-----------------------------------------------------

  insertItemAfterId(my_item: List_Item, my_id: number) {
    for (var i = 0; i<this.length; i++) {
      if (this.id[i]==my_id) {
        //First set the correct identifyer
        my_item.id = this.curid;
        my_item.parent = this.data[i].parent;
        my_item.indent = this.data[i].indent;
        my_item.Parent_Item = this.data[this.getOrdinalById(my_item.parent)];
        my_item.collapsed = false;

        //Insert the data
        this.data.splice(i+1,0,my_item);
        this.active.splice(i+1,0,true);
        this.id.splice(i+1,0,this.curid);

        //Adjust length of the queue and future identifyer
        this.curid += 1;
        this.length += 1;

        return(i+1);
        break;
      }
    }
    this.reSort();
  }

  //-----------------------------------------------------

  insertChildAfterId(my_item: List_Item, my_id: number) {
    var numchilds:number = this.getNumChilds(my_id);
    var maxchilds:number = this.getMaxNumChilds(my_id);

    if (numchilds < maxchilds) {
      var ordinal:number = this.insertItemAfterId(my_item, my_id);
      this.data[ordinal].parent = my_id;
      this.data[ordinal].indent = this.data[ordinal-1].indent+1;
      this.data[ordinal].Parent_Item = this.data[this.getOrdinalById(my_id)];
    } else {
      alert("Het maximum aantal kinderen van dit element is "+maxchilds);
    }
    this.reSort();
  }

  //-----------------------------------------------------

  moveUp(my_id: number) {
    //-- First find the ordinal number of the current location and the desired location --
    let currentOrdinal = this.getOrdinalById(my_id);
    let newOrdinal = currentOrdinal;
    let currentparent = this.data[currentOrdinal].parent;
    for (var i = currentOrdinal-1; i>=0; i--) {
      if ( (this.data[i].parent == currentparent) && (this.active[i]) ) {
        newOrdinal = i;
        break; //Leave the for loop
      }
    }
    //Swap both items (we swap data and id, we do not need to swap active as both items are active by construction)
    var swapItem: List_Item = new List_Item();
    swapItem = this.data[currentOrdinal];
    this.data[currentOrdinal] = this.data[newOrdinal];
    this.data[newOrdinal] = swapItem;

    var swapID = this.id[currentOrdinal];
    this.id[currentOrdinal] = this.id[newOrdinal];
    this.id[newOrdinal] = swapID;

    this.reSort();
  }

  //-----------------------------------------------------

  moveDown(my_id: number) {
    //-- First find the ordinal number of the current location and the desired location --
    let currentOrdinal = this.getOrdinalById(my_id);
    let newOrdinal = currentOrdinal;
    let currentparent = this.data[currentOrdinal].parent;
    for (var i = currentOrdinal+1; i<this.length; i++) {
      if ( (this.data[i].parent == currentparent) && (this.active[i]) ) {
        newOrdinal = i;
        break; //Leave the for loop
      }
    }
    //Swap both items (we swap data and id, we do not need to swap active as both items are active by construction)
    var swapItem: List_Item = new List_Item();
    swapItem = this.data[currentOrdinal];
    this.data[currentOrdinal] = this.data[newOrdinal];
    this.data[newOrdinal] = swapItem;

    var swapID = this.id[currentOrdinal];
    this.id[currentOrdinal] = this.id[newOrdinal];
    this.id[newOrdinal] = swapID;

    this.reSort();
  }

  //-----------------------------------------------------

  clone(my_id: number, parent_id?: number) {
    //-- First find the ordinal number of the current location and the desired location --
    //   Also look for the original length of the structure
    let currentOrdinal = this.getOrdinalById(my_id);
    var original_length = this.length;
    //-- Then create a clone of the object and assign the correct parent_id
    if(arguments.length < 2) {
      parent_id = this.data[currentOrdinal].parent
    }
    let parentOrdinal = this.getOrdinalById(parent_id);
    var my_item = new Electro_Item(this.data[parentOrdinal]);
    my_item.clone(this.data[currentOrdinal]);
    //-- Now add the clone to the structure
    //   The clone will have id this.curid-1
    if(arguments.length < 2) {
      this.insertItemAfterId(my_item, my_id); //Cloning the top-element, this messes up the ordinals !!
    } else {
      this.insertChildAfterId(my_item, parent_id); //Cloning childs, this messes up the ordinals !!
    }
    var new_id = this.curid-1;
    this.data[this.getOrdinalById(new_id)].collapsed = this.data[this.getOrdinalById(my_id)].collapsed;
    //-- Now loop over the childs of the original and also clone those
    var toClone = new Array(); //list of id's to clone
    for (var i = 0; i<original_length; i++) {
      if (this.id[i]==my_id) {
        for (var j=original_length-1; j>=0; j--) { //We need to loop in opposite sense
          if (this.data[j].parent==my_id) toClone.push(this.id[j]);
        }
      }
    }
    for (var clone_id=0; clone_id<toClone.length; clone_id++) {
      this.clone(toClone[clone_id],new_id);
    }
    this.reSort();
  }

  //-----------------------------------------------------

  deleteById(my_id: number) {
    for (var i = 0; i<this.length; i++) {
      if (this.id[i]==my_id) {
        this.active[i] = false;
        for (var j=0; j<this.length; j++) {
          if (this.data[j].parent==my_id) this.deleteById(this.id[j]);
        }
      }
    }
    this.reSort();
  }

  //-----------------------------------------------------

  toHTML(myParent: number) {
    var output: string = "";
    var numberDrawn: number = 0;
    //-- bovenaan de switch van editeer-mode (teken of verplaats) --
    if (myParent == 0) {
      switch (this.mode) {
        case "edit":
          output+= 'Modus (Invoegen/Verplaatsen/Clone) <select id="edit_mode" onchange="HL_editmode()"><option value="edit" selected>Invoegen</option><option value="move">Verplaatsen/Clone</option></select><br><br>';
          break;
        case "move":
          output+= 'Modus (Invoegen/Verplaatsen/Clone) <select id="edit_mode" onchange="HL_editmode()"><option value="edit">Invoegen</option><option value="move" selected>Verplaatsen/Clone</option></select>'+
                   '<span style="color:black"><i>&nbsp;Gebruik de pijlen om de volgorde van elementen te wijzigen. '+
                   'Gebruik het Moeder-veld om een component elders in het schema te hangen. Kies "clone" om een dubbel te maken van een element.</i></span><br><br>';
          break;
      }
      //-- plaats input box voor naam van het schema bovenaan --
      //output += 'Bestandsnaam: <span id="settings"><code>' + this.properties.filename + '</code>&nbsp;<button onclick="HL_enterSettings()">Wijzigen</button>&nbsp;<button onclick="exportjson()">Opslaan</button></span><br><br>'
    }

    //--Teken het volledige schema in HTML--
    for (var i = 0; i<this.length; i++) {
      if (this.active[i] && (this.data[i].parent == myParent)) {
        numberDrawn++;
        if (this.data[i].collapsed) {
          output += '<table class="html_edit_table"><tr><td bgcolor="#8AB2E4" onclick="HLCollapseExpand(' + this.data[i].id + ')" valign= "top">&#x229E;</td><td width="100%">'
        } else {
          output += '<table class="html_edit_table"><tr><td bgcolor="#C0C0C0" onclick="HLCollapseExpand(' + this.data[i].id + ')" valign= "top">&#x229F;</td><td width="100%">'
        }
        switch(myParent) {
          case 0: {
            output += this.data[i].toHTML(structure.mode) + "<br>";
            break; }
          default: {
            output += this.data[i].toHTML(structure.mode,this.data[this.getOrdinalById(myParent)]) + "<br>";
            break; }
        }
        if (!this.data[i].collapsed) {
          output += this.toHTML(this.id[i]);
        }
        output += "</td></tr></table>"
      }
    }
    if ( (myParent == 0) && (numberDrawn<1) ) {
      output += "<button onclick=\"HLAdd()\">Voeg eerste object toe of kies bovenaan \"opnieuw beginnen\"</button>"; //no need for the add button if we have items
    }
    return(output);
  }

  //-----------------------------------------------------

  toSVG(myParent: number, stack: string, minxleft: number = 0, includeparent: boolean = false) { //stack can be "horizontal" or "vertical"

    //--- First read all underlying elements in an Array called inSVG ---

    var inSVG: Array<SVGelement> = new Array<SVGelement>(); //Results from nested calls will be added here
    var elementCounter: number = 0;
    var lastChildOrdinal = 0;

    if ( (myParent != 0) && ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Meerdere verbruikers") ) {
      for (var i = 0; i<this.length; i++) {
        //empty tekst at the end does not count as a valid last child
        if (this.active[i] && (this.data[i].keys[16][2] != "zonder kader") && (this.data[i].parent == myParent)) lastChildOrdinal = i;
      }
    } else { //if not a child of meerdere verbruikers, we also allow the parent to be the lastChild
      for (var i = 0; i<this.length; i++) {
        //empty tekst at the end does not count as a valid last child
        if (this.active[i] && (this.data[i].keys[16][2] != "zonder kader") && (this.data[i].parent == myParent)) lastChildOrdinal = i;
        if (this.active[i] && (this.data[i].keys[16][2] != "zonder kader") && (includeparent==true) && (this.id[i] == myParent)) lastChildOrdinal = i;
      }
    }

    for (var i = 0; i<this.length; i++) {
      if (this.active[i] && ( (this.data[i].parent == myParent) || ( (includeparent==true) && (this.id[i] == myParent) ) ) ) {
        switch (this.data[i].getKey("type")) {
          case "Bord":
            //get image of the entire bord
            inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal");
            inSVG[elementCounter].xright += 10;
            if (this.data[i].getKey("geaard")) {
              if (inSVG[elementCounter].xleft <=100) {
                var toShift = 100-inSVG[elementCounter].xleft;
                inSVG[elementCounter].xleft = 100;
                inSVG[elementCounter].xright -= toShift;
              }
            } else {
              if (inSVG[elementCounter].xleft <=30) {
                var toShift = 30-inSVG[elementCounter].xleft;
                inSVG[elementCounter].xleft = 30;
                inSVG[elementCounter].xright -= toShift;
              }
            }
            if (inSVG[elementCounter].xright <=10) inSVG[elementCounter].xright = 10;

            //Ensure there is enough space to draw the bottom line
            inSVG[elementCounter].ydown = Math.max(inSVG[elementCounter].ydown,1);

            //Draw the bottom line
            inSVG[elementCounter].data = inSVG[elementCounter].data +
              '<line x1="4" x2="' + (inSVG[elementCounter].xleft + inSVG[elementCounter].xright-6) +
              '" y1="' + inSVG[elementCounter].yup + '" y2="' + inSVG[elementCounter].yup + '" stroke="black" stroke-width="3" />'

            //Add name of the board
            if (this.data[i].getKey("naam") !== "") {
              inSVG[elementCounter].data += '<text x="' + (0) + '" y="' + (inSVG[elementCounter].yup + 13) + '" ' +
                'style="text-anchor:start" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="10">&lt;' +
                htmlspecialchars(this.data[i].getKey("naam"))+'&gt;</text>';
            };

            //Add an image of the grounding
            if (this.data[i].getKey("geaard")) {
              inSVG[elementCounter].data += '<line x1="40" y1="' + (inSVG[elementCounter].yup + 0) + '" x2="40" y2="' + (inSVG[elementCounter].yup + 10) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="40" y1="' + (inSVG[elementCounter].yup + 15) + '" x2="40" y2="' + (inSVG[elementCounter].yup + 25) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="40" y1="' + (inSVG[elementCounter].yup + 30) + '" x2="40" y2="' + (inSVG[elementCounter].yup + 40) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="35" y1="' + (inSVG[elementCounter].yup + 10) + '" x2="45" y2="' + (inSVG[elementCounter].yup + 10) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="35" y1="' + (inSVG[elementCounter].yup + 15) + '" x2="45" y2="' + (inSVG[elementCounter].yup + 15) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="35" y1="' + (inSVG[elementCounter].yup + 25) + '" x2="45" y2="' + (inSVG[elementCounter].yup + 25) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="35" y1="' + (inSVG[elementCounter].yup + 30) + '" x2="45" y2="' + (inSVG[elementCounter].yup + 30) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="30" y1="' + (inSVG[elementCounter].yup + 40) + '" x2="50" y2="' + (inSVG[elementCounter].yup + 40) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="32.5" y1="' + (inSVG[elementCounter].yup + 43) + '" x2="47.5" y2="' + (inSVG[elementCounter].yup + 43) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="35" y1="' + (inSVG[elementCounter].yup + 46) + '" x2="45" y2="' + (inSVG[elementCounter].yup + 46) + '" stroke="black" />';
            };
            break;

          case "Splitsing":
            //Algoritme werkt gelijkaardig aan een "Bord", eerst maken we een tekening van het geheel
            inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal");

            switch ((this.data[this.getOrdinalById(myParent)]).getKey("type")) {
              case "Aansluiting":
              case "Kring": //in-line with kring or aansluiting
                inSVG[elementCounter].data = inSVG[elementCounter].data +
                  '<line x1="' + (inSVG[elementCounter].xleft) + '" x2="' + (inSVG[elementCounter].xleft + inSVG[elementCounter].xrightmin) +
                  '" y1="' + inSVG[elementCounter].yup + '" y2="' + inSVG[elementCounter].yup + '" stroke="black" />'
                break;
              default:
                if ((inSVG[elementCounter].xright + inSVG[elementCounter].xleft) <=0) inSVG[elementCounter].xrightmin = 15; // ensure we see there is a "splitsing"
                if (inSVG[elementCounter].yup < 25) inSVG[elementCounter].yup = 25;
                if (inSVG[elementCounter].ydown < 25) inSVG[elementCounter].ydown = 25;
                inSVG[elementCounter].data = inSVG[elementCounter].data +
                  '<line x1="' + (1) + '" x2="' + (inSVG[elementCounter].xleft + inSVG[elementCounter].xrightmin) +
                  '" y1="' + inSVG[elementCounter].yup + '" y2="' + inSVG[elementCounter].yup + '" stroke="black" />'
                var toShift = inSVG[elementCounter].xleft;
                inSVG[elementCounter].xleft -= toShift - 1; //we leave one pixel for the bold kring-line at the left
                inSVG[elementCounter].xright += toShift;
                break;
            }
            break;

          case "Domotica":
            //Algoritme werkt gelijkaardig aan een "Bord" en "Splitsing", eerst maken we een tekening van het geheel
            inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal");

            //Make sure there is always enough space to display the element
            if ((inSVG[elementCounter].xright + inSVG[elementCounter].xleft) <=100) inSVG[elementCounter].xright = (100 - inSVG[elementCounter].xleft) ;
            inSVG[elementCounter].yup = Math.max(inSVG[elementCounter].yup+20, 25);
            inSVG[elementCounter].ydown += Math.max(inSVG[elementCounter].ydown, 25);

            var width = (inSVG[elementCounter].xleft + inSVG[elementCounter].xright - 20);
            inSVG[elementCounter].data = inSVG[elementCounter].data +
              '<rect x="' + (20) + '" width="' + (width) +
              '" y="' + (inSVG[elementCounter].yup-20) + '" height="' + (40) + '" stroke="black" stroke-width="2" fill="white" />'
            inSVG[elementCounter].data = inSVG[elementCounter].data +
              '<line x1="0" x2="20" y1="' + (inSVG[elementCounter].yup) + '" y2="' + (inSVG[elementCounter].yup) + '" stroke="black" />'
            inSVG[elementCounter].data +=
              '<text x="' + (21 + width/2) + '" y="' + (inSVG[elementCounter].yup+3) + '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="bold">' + htmlspecialchars(this.data[i].keys[15][2]) + '</text>';

            var toShift = inSVG[elementCounter].xleft;
            inSVG[elementCounter].xleft -= toShift - 1; //we leave one pixel for the bold kring-line at the left
            inSVG[elementCounter].xright += toShift - 1;

            //If direct child of a Kring, put a vertical pipe and "nr" at the left
            if (myParent != 0) {
              if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Kring") {

                var y1, y2: number;
                if (i !== lastChildOrdinal) {
                  y1 = 0;
                  y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
                } else {
                  y1 = inSVG[elementCounter].yup;
                  y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
                }

                inSVG[elementCounter].data = inSVG[elementCounter].data +
                  '<line x1="' + inSVG[elementCounter].xleft +
                  '" x2="' + inSVG[elementCounter].xleft +
                  '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" />'

                inSVG[elementCounter].data +=
                  '<text x="' + (inSVG[elementCounter].xleft+9) + '" y="' + (inSVG[elementCounter].yup - 5) + '" ' +
                  'style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
                  htmlspecialchars(this.data[i].getKey("naam"))+'</text>';
              };
            };

            break;

          case "Meerdere verbruikers":
            //Algoritme werkt gelijkaardig aan een "Bord", eerst maken we een tekening van het geheel
            inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal");

            //We voorzien altijd verticale ruimte, zelfs als de kinderen nog niet gedefinieerd zijn
            inSVG[elementCounter].ydown = Math.max(inSVG[elementCounter].ydown,25);
            inSVG[elementCounter].yup = Math.max(inSVG[elementCounter].yup,25);
            inSVG[elementCounter].xleft = Math.max(inSVG[elementCounter].xleft,1);

            //--plaats adres onderaan als nodig--
            if (!(/^\s*$/.test(this.data[i].keys[15][2]))) { //check if adres contains only white space
              inSVG[elementCounter].data += '<text x="' + ((inSVG[elementCounter].xright-20)/2 + 21) + '" y="' + (inSVG[elementCounter].yup+inSVG[elementCounter].ydown+10)
                + '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-style="italic">' + htmlspecialchars(this.data[i].keys[15][2]) + '</text>';
              inSVG[elementCounter].ydown += 15;
            }

            //If direct child of a Kring, put a vertical pipe and "nr" at the left
            if (myParent != 0) {
              if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Kring") {

                var y1, y2: number;
                if (i !== lastChildOrdinal) {
                  y1 = 0;
                  y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
                } else {
                  y1 = inSVG[elementCounter].yup;
                  y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
                }

                inSVG[elementCounter].data = inSVG[elementCounter].data +
                  '<line x1="' + inSVG[elementCounter].xleft +
                  '" x2="' + inSVG[elementCounter].xleft +
                  '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" />'

                inSVG[elementCounter].data +=
                  '<text x="' + (inSVG[elementCounter].xleft+9) + '" y="' + (inSVG[elementCounter].yup - 5) + '" ' +
                  'style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
                  htmlspecialchars(this.data[i].getKey("naam"))+'</text>';
              };
            };

            break;

          case "Aansluiting":
            //get image of the entire stack, make sure it is shifted to the right sufficiently so-that the counter can be added below
            inSVG[elementCounter] = this.toSVG(this.id[i],"vertical",150); //shift 100 to the right

            //add the fuse below

            inSVG[elementCounter].data += '<line x1="' + inSVG[elementCounter].xleft +
              '" x2="' + inSVG[elementCounter].xleft +
              '" y1="' + inSVG[elementCounter].yup +
              '" y2="' + (inSVG[elementCounter].yup+20) + '" stroke="black" />';
            inSVG[elementCounter].yup += 20;

            switch (this.data[i].getKey("zekering")) {
              case "automatisch":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_automatisch" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") +"</text>";
                break;
              case "schakelaar":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_empty" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
              break;
              case "schemer":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_empty" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                 inSVG[elementCounter].data +=
                   '<use xlink:href="#arrow" x=\"' + (inSVG[elementCounter].xleft-18) +
                   '" y="' + (inSVG[elementCounter].yup-15) + '" />';
                 inSVG[elementCounter].data +=
                   '<use xlink:href="#arrow" x=\"' + (inSVG[elementCounter].xleft-18) +
                   '" y="' + (inSVG[elementCounter].yup-12) + '" />';
                break;
              case "differentieel":
                if (this.data[i].keys[20][2]) { //Differentieel is selectief
                  inSVG[elementCounter].data += '<line x1="' + inSVG[elementCounter].xleft +
                    '" x2="' + inSVG[elementCounter].xleft +
                    '" y1="' + inSVG[elementCounter].yup +
                    '" y2="' + (inSVG[elementCounter].yup+30) + '" stroke="black" />';
                  inSVG[elementCounter].data += '<rect x="' + (inSVG[elementCounter].xleft+7) +
                    '" y="' + (inSVG[elementCounter].yup) +
                    '" width="16" height="16" stroke="black" fill="white" />';
                  inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                     "\" y=\"" + (inSVG[elementCounter].yup+12) +
                     "\"" +
                     " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                     "," + (inSVG[elementCounter].yup+8) +
                     ")" +
                      "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                     "S" + "</text>";
                  inSVG[elementCounter].yup += 23;
                }
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_automatisch" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+25) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+25) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                  "\" y=\"" + (inSVG[elementCounter].yup-10) +
                  "\"" +
                  " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                  "," + (inSVG[elementCounter].yup-10) +
                  ")" +
                  "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                  "\u0394" + htmlspecialchars(this.data[i].getKey("differentieel_waarde") + "mA") + "</text>";
                if ( (this.data[i].keys[17][2]=='A') || (this.data[i].keys[17][2]=='B') ) {
                  inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+35) +
                    "\" y=\"" + (inSVG[elementCounter].yup-10) +
                    "\"" +
                    " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+35) +
                    "," + (inSVG[elementCounter].yup-10) +
                    ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                    htmlspecialchars("Type " + this.data[i].keys[17][2]) + "</text>";
                  inSVG[elementCounter].xright = Math.max(inSVG[elementCounter].xright,40);
                }
                break;
              case "smelt":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_smelt" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                break;
              case "geen":
                inSVG[elementCounter].yup += 0;
                break;
            }

            //draw the counter
            inSVG[elementCounter].data += '<line x1="1" ' +
              'y1="' + (inSVG[elementCounter].yup+25) +
              '" x2="21" '+
              'y2="' + (inSVG[elementCounter].yup+25) + '" stroke="black"></line>';

            //draw outgoing connecting lines
            inSVG[elementCounter].data += '<line x1="60" ' +
              'y1="' + (inSVG[elementCounter].yup+25) +
              '" x2="' + (inSVG[elementCounter].xleft) + '" '+
              'y2="' + (inSVG[elementCounter].yup+25) + '" stroke="black"></line>';
            inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft) +
              '" y1="' + (inSVG[elementCounter].yup) +
              '" x2="' + (inSVG[elementCounter].xleft) + '" '+
              'y2="' + (inSVG[elementCounter].yup+25) + '" stroke="black"></line>';

            //Draw the counter
            inSVG[elementCounter].data += '<use xlink:href="#elektriciteitsmeter" x="21" y="' + (inSVG[elementCounter].yup+25) + '"></use>';

            //set kabel type Text
            inSVG[elementCounter].data += '<text x="100" y="' + (inSVG[elementCounter].yup+40) +
               '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
               htmlspecialchars(this.data[i].getKey("kabel")) + '</text>';

            //inSVG[elementCounter].xleft = Math.max(inSVG[elementCounter].xleft,60);
            //inSVG[elementCounter].xright = Math.max(inSVG[elementCounter].xright,10);
            //Foresee sufficient room below for the counter
            inSVG[elementCounter].yup += 25;
            inSVG[elementCounter].ydown = 25;

            //If adres is not empty, put it below
            if (!(/^\s*$/.test(this.data[i].keys[15][2]))) { //check if adres contains only white space
              inSVG[elementCounter].data += '<text x="41" y="' + (inSVG[elementCounter].yup+inSVG[elementCounter].ydown+10) + '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-style="italic">' + htmlspecialchars(this.data[i].keys[15][2]) + '</text>';
              inSVG[elementCounter].ydown += 15;
            }

            //rework xleft and xright to ensure the entire structure is always at the right of a potential parent kring
            var width = inSVG[elementCounter].xleft + inSVG[elementCounter].xright;
            inSVG[elementCounter].xleft = 1;
            inSVG[elementCounter].xright = width-1;

            //If direct child of a Kring, put a vertical pipe and "nr" at the left
            if (myParent != 0) {
            if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Kring") {

              var y1, y2: number;
              if (i !== lastChildOrdinal) {
                y1 = 0;
                y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
              } else {
                y1 = inSVG[elementCounter].yup;
                y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
              }

              inSVG[elementCounter].data = inSVG[elementCounter].data +
                '<line x1="' + inSVG[elementCounter].xleft +
                '" x2="' + inSVG[elementCounter].xleft +
                '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" />'

              inSVG[elementCounter].data +=
                '<text x="' + (inSVG[elementCounter].xleft+9) + '" y="' + (inSVG[elementCounter].yup - 5) + '" ' +
                'style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
                htmlspecialchars(this.data[i].getKey("naam"))+'</text>';
            };};

            break;

          case "Kring":
            let cable_location_available: number = 0;
            if ( (this.data[i].getKey("kabel_aanwezig"))
                && (this.data[i].keys[19][2] || contains(["Ondergronds","Luchtleiding","In wand","Op wand"],this.data[i].keys[16][2]) ) ) {
                  cable_location_available = 1;
            }

            //get image of the entire kring
            inSVG[elementCounter] = this.toSVG(this.id[i],"vertical",35 + 20*cable_location_available);

            //--- Code for the cable including text and indications where the cable is located ---

            if (this.data[i].getKey("kabel_aanwezig")) {
              //foresee space for the conductor specifications
              inSVG[elementCounter].data += '<line x1="' + inSVG[elementCounter].xleft +
                '" x2="' + inSVG[elementCounter].xleft +
                '" y1="' + inSVG[elementCounter].yup +
                '" y2="' + (inSVG[elementCounter].yup+100) + '" stroke="black" />';
              inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                 "\" y=\"" + (inSVG[elementCounter].yup+80) +
                 "\"" +

                 " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                 "," + (inSVG[elementCounter].yup+80) +
                 ")" +

                  "\" style=\"text-anchor:start\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                 htmlspecialchars(this.data[i].getKey("kabel")) + "</text>";

               //Draw the cable location symbols
               if (cable_location_available) {
                 if ( (this.data[i].keys[19][2]) && (this.data[i].keys[16][2] != "Luchtleiding") )  {
                   inSVG[elementCounter].data += '<circle cx="' + (inSVG[elementCounter].xleft-10)
                                               + '" cy="' + (inSVG[elementCounter].yup+40)
                                               +'" r="4" style="stroke:black;fill:none" />';
                 }
                 switch (this.data[i].keys[16][2]) {
                   case "Ondergronds":
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-13)
                                               + '" x2="' + (inSVG[elementCounter].xleft-13)
                                               + '" y1="' + (inSVG[elementCounter].yup+60)
                                               + '" y2="' + (inSVG[elementCounter].yup+80)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-10)
                                               + '" x2="' + (inSVG[elementCounter].xleft-10)
                                               + '" y1="' + (inSVG[elementCounter].yup+62)
                                               + '" y2="' + (inSVG[elementCounter].yup+78)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-7)
                                               + '" x2="' + (inSVG[elementCounter].xleft-7)
                                               + '" y1="' + (inSVG[elementCounter].yup+64)
                                               + '" y2="' + (inSVG[elementCounter].yup+76)
                                               +'" style="stroke:black" />';
                     break;
                   case "Luchtleiding":
                     inSVG[elementCounter].data += '<circle cx="' + (inSVG[elementCounter].xleft)
                                                   + '" cy="' + (inSVG[elementCounter].yup+20)
                                                   +'" r="4" style="stroke:black;fill:none" />';
                     break;
                   case "In wand":
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-15)
                                               + '" y1="' + (inSVG[elementCounter].yup+10)
                                               + '" y2="' + (inSVG[elementCounter].yup+30)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+10)
                                               + '" y2="' + (inSVG[elementCounter].yup+10)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+20)
                                               + '" y2="' + (inSVG[elementCounter].yup+20)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+30)
                                               + '" y2="' + (inSVG[elementCounter].yup+30)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-15)
                                               + '" y1="' + (inSVG[elementCounter].yup+65)
                                               + '" y2="' + (inSVG[elementCounter].yup+85)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+85)
                                               + '" y2="' + (inSVG[elementCounter].yup+85)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+65)
                                               + '" y2="' + (inSVG[elementCounter].yup+65)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+75)
                                               + '" y2="' + (inSVG[elementCounter].yup+75)
                                               +'" style="stroke:black" />';
                     break;
                   case "Op wand":
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-5)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+10)
                                               + '" y2="' + (inSVG[elementCounter].yup+30)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+10)
                                               + '" y2="' + (inSVG[elementCounter].yup+10)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+20)
                                               + '" y2="' + (inSVG[elementCounter].yup+20)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+30)
                                               + '" y2="' + (inSVG[elementCounter].yup+30)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-5)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+65)
                                               + '" y2="' + (inSVG[elementCounter].yup+85)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+85)
                                               + '" y2="' + (inSVG[elementCounter].yup+85)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+65)
                                               + '" y2="' + (inSVG[elementCounter].yup+65)
                                               +'" style="stroke:black" />';
                     inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft-15)
                                               + '" x2="' + (inSVG[elementCounter].xleft-5)
                                               + '" y1="' + (inSVG[elementCounter].yup+75)
                                               + '" y2="' + (inSVG[elementCounter].yup+75)
                                               +'" style="stroke:black" />';
                     break;
                 }
               }

              inSVG[elementCounter].yup += 100;
            } else {
              inSVG[elementCounter].data += '<line x1="' + inSVG[elementCounter].xleft +
                '" x2="' + inSVG[elementCounter].xleft +
                '" y1="' + inSVG[elementCounter].yup +
                '" y2="' + (inSVG[elementCounter].yup+20) + '" stroke="black" />';
              inSVG[elementCounter].yup += 20;
            }

            //--- Code for selective diff ---

            if (this.data[i].keys[20][2]) { //Differentieel is selectief
              inSVG[elementCounter].data += '<line x1="' + inSVG[elementCounter].xleft +
                '" x2="' + inSVG[elementCounter].xleft +
                '" y1="' + inSVG[elementCounter].yup +
                '" y2="' + (inSVG[elementCounter].yup+30) + '" stroke="black" />';
              inSVG[elementCounter].data += '<rect x="' + (inSVG[elementCounter].xleft+7) +
                '" y="' + (inSVG[elementCounter].yup) +
                '" width="16" height="16" stroke="black" fill="white" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+19) +
                   "\" y=\"" + (inSVG[elementCounter].yup+8) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+19) +
                   "," + (inSVG[elementCounter].yup+8) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   "S" + "</text>";
              inSVG[elementCounter].yup += 23;
            }

            //--- End of large code block ---

            //add the fuse below
            var nameshift = -6;
            switch (this.data[i].getKey("zekering")) {
              case "automatisch":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_automatisch" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                break;
              case "schakelaar":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_empty" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                  "\" y=\"" + (inSVG[elementCounter].yup-10) +
                  "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                  "," + (inSVG[elementCounter].yup-10) +
                  ")" +
                  "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                  htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                break;
              case "overspanningsbeveiliging":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#overspanningsbeveiliging_inline" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+20) +
                  "\" y=\"" + (inSVG[elementCounter].yup-10) +
                  "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+20) +
                  "," + (inSVG[elementCounter].yup-10) +
                  ")" +
                  "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                  htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                  nameshift = -11;
                break;
              case "schemer":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_empty" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                  "\" y=\"" + (inSVG[elementCounter].yup-10) +
                  "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                  "," + (inSVG[elementCounter].yup-10) +
                  ")" +
                  "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                  htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                inSVG[elementCounter].data +=
                  '<use xlink:href="#arrow" x=\"' + (inSVG[elementCounter].xleft-18) +
                  '" y="' + (inSVG[elementCounter].yup-15) + '" />';
                inSVG[elementCounter].data +=
                  '<use xlink:href="#arrow" x=\"' + (inSVG[elementCounter].xleft-18) +
                  '" y="' + (inSVG[elementCounter].yup-12) + '" />';
                break;
              case "differentieel":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_automatisch" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                  "\" y=\"" + (inSVG[elementCounter].yup-10) +
                  "\"" +
                  " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                  "," + (inSVG[elementCounter].yup-10) +
                  ")" +
                  "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                  "\u0394" + htmlspecialchars(this.data[i].getKey("differentieel_waarde") + "mA") + "</text>";
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+25) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+25) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                if ( (this.data[i].keys[17][2]=='A') || (this.data[i].keys[17][2]=='B') ) {
                  inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+35) +
                    "\" y=\"" + (inSVG[elementCounter].yup-10) +
                    "\"" +
                    " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+35) +
                    "," + (inSVG[elementCounter].yup-10) +
                    ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                    htmlspecialchars("Type " + this.data[i].keys[17][2]) + "</text>";
                  inSVG[elementCounter].xright = Math.max(inSVG[elementCounter].xright,40);
                }
                break;
              case "smelt":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_smelt" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " +  this.data[i].getKey("amperage") + "A") + "</text>";
                break;
              case "geen":
                inSVG[elementCounter].yup += 0;
                break;
            }

            //--Tekst naast de kring--
            var tekstlocatie = (inSVG[elementCounter].yup-40); //Standaard staat tekst boven de zekering
            if (this.data[i].getKey("zekering")=="geen") tekstlocatie+=25; //Als er geen zekering is kan tekst naar beneden
            inSVG[elementCounter].data +=
                  '<text x="' + (inSVG[elementCounter].xleft-6-20*cable_location_available) + '" '
                  + 'y="' + (tekstlocatie) + '" '
                  + 'transform="rotate(-90 ' + (inSVG[elementCounter].xleft-6-20*cable_location_available) + ',' + (tekstlocatie) + ')" '
                  + 'style="text-anchor:start" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="12"'
                  + '>'
                  + htmlspecialchars(this.data[i].getKey("commentaar"))
                  + '</text>';

            //--Naam onderaan zetten (links-onder)--
            inSVG[elementCounter].data +=
                  '<text x="' + (inSVG[elementCounter].xleft+nameshift) + '" '
                  + 'y="' + (inSVG[elementCounter].yup+3) + '" '
                  //+ 'transform="rotate(-90 ' + (inSVG[elementCounter].xleft-6) + ',' + (inSVG[elementCounter].yup+3) + ')" '
                  + 'style="text-anchor:end" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="12"'
                  + '>'
                  + htmlspecialchars(this.data[i].getKey("naam"))
                  + '</text>';

            //--Lijntje onder de zekering--
            inSVG[elementCounter].data += '<line x1="' + inSVG[elementCounter].xleft +
            '" x2="' + inSVG[elementCounter].xleft +
            '" y1="' + inSVG[elementCounter].yup +
            '" y2="' + (inSVG[elementCounter].yup+15) + '" stroke="black" />';
            inSVG[elementCounter].yup += 15;

            //if there is nothing, still draw an empty one
            if (inSVG[elementCounter].yup <= 0) {
              inSVG[elementCounter].xleft = 20;
              inSVG[elementCounter].xright = 20;
              inSVG[elementCounter].yup = 50;
              inSVG[elementCounter].ydown = 0;
            }

            break;

          case "":
            inSVG[elementCounter] = new SVGelement();
            break;

          default:
            var x = this.data[this.getOrdinalById(myParent)].getKey("type");
            //get image of all lowest level elements

            if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Meerdere verbruikers") {
              inSVG[elementCounter] = this.data[i].toSVG(i !== lastChildOrdinal);
            } else if (stack == "vertical") {
              inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal",0,true); //if we are still in vertical mode, switch to horizontal and take childs with us
            } else { //we are in horizontal mode and can start drawing
              //First get the image itself
              //if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Meerdere verbruikers") {
                //the following function takes true as an argument if there is still an element following in a horizontal chain.
                //This is the case if the element is not last and/or not followed by empty tekst without border
                if (this.id[i] == myParent) {
                  inSVG[elementCounter] = this.data[i].toSVG(i !== lastChildOrdinal);
                } else {
                  inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal",0,true); //if we are still in vertical mode, switch to horizontal and take childs with us
                }
              //} else {
              //  inSVG[elementCounter] = this.data[i].toSVG(false);
              //}
            }

            //If direct child of a Kring, put a vertical pipe and "nr" at the left
            if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Kring") {

              var y1, y2: number;
              if (i !== lastChildOrdinal) {
                y1 = 0;
                y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
              } else {
                y1 = inSVG[elementCounter].yup;
                y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
              }

              inSVG[elementCounter].data = inSVG[elementCounter].data +
                '<line x1="' + inSVG[elementCounter].xleft +
                '" x2="' + inSVG[elementCounter].xleft +
                '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" />'

              inSVG[elementCounter].data +=
                '<text x="' + (inSVG[elementCounter].xleft+9) + '" y="' + (inSVG[elementCounter].yup - 5) + '" ' +
                'style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
                htmlspecialchars(this.data[i].getKey("naam"))+'</text>';

              //--See if we can add childs to the left --
              //elementCounter++
              //inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal");
            };

        }
        elementCounter++;

        //outSVG.xleft = Math.max(outSVG.xleft,inSVG[elementCounter].xleft);
      }
    }

    //--- If there are no elements, make at least an empty one to avoid problems here below ---

    if (elementCounter == 0) {
      inSVG[0] = new SVGelement();
    }

    //--- Now create the output element ---

    var outSVG: SVGelement = new SVGelement;
    outSVG.xleft = 0; outSVG.xright = 0; outSVG.yup = 0; outSVG.ydown = 0;
    outSVG.data = "";

    var width: number = 0; //How wide is the structure?
    var height: number = 0; //How high is the structure?

    switch (stack) {
      case "horizontal":

        var max_yup : number = 0; //What is the maximal distance above the horizontal line?
        var max_ydown : number = 0; //What is the maximal distance below the horizontal line?

        //analyse the size of the structure. Build horizontally
        for (var i = 0; i<elementCounter; i++) {
          width = width + inSVG[i].xleft + inSVG[i].xright;
          max_yup = Math.max(max_yup,inSVG[i].yup);
          max_ydown = Math.max(max_ydown,inSVG[i].ydown);
        }
        height = max_yup + max_ydown;

        //decide on the output structure
        if (elementCounter > 0) {
          outSVG.xleft = inSVG[0].xleft; //Leave space of the first element at the left
          outSVG.xright = width - outSVG.xleft;
          outSVG.xrightmin = outSVG.xright - inSVG[elementCounter-1].xright;
        } else {
          outSVG.xleft = 0;
          outSVG.xright = 0;
          outSVG.xrightmin = 0;
        };
        outSVG.yup = max_yup;
        outSVG.ydown = max_ydown;

        //--Create the output data--
        var xpos:number = 0;

        for (var i = 0; i<elementCounter; i++) {
          outSVG.data += '<svg x="' + xpos + '" y="' + (max_yup-inSVG[i].yup) + '">';
          outSVG.data += inSVG[i].data;
          outSVG.data += '</svg>';
          xpos += inSVG[i].xleft + inSVG[i].xright;
        }

        break;

      case "vertical":

        var max_xleft : number = 0; //What is the maximal distance left of the vertical line?
        var max_xright : number = 0; //What is the maximal distance right of the vertical line?

        //analyse the size of the structure. Build vertically
        for (var i = 0; i<elementCounter; i++) {
          height = height + inSVG[i].yup + inSVG[i].ydown;
          max_xleft = Math.max(max_xleft,inSVG[i].xleft);
          max_xright = Math.max(max_xright,inSVG[i].xright);
        }
        max_xleft = Math.max(minxleft, max_xleft);
        width = max_xleft + max_xright;

        //decide on the output structure
        outSVG.yup = height; //As a general rule, there is no ydown, but to be confirmed
        outSVG.ydown = 0;
        outSVG.xleft = Math.max(max_xleft,35); // foresee at least 35 for text at the left
        outSVG.xright = Math.max(max_xright,25); // foresee at least 25 at the right

        //create the output data
        var ypos:number = 0;

        for (var i = elementCounter-1; i>=0; i--) {
          outSVG.data += '<svg x="' + (outSVG.xleft-inSVG[i].xleft) + '" y="' + ypos + '">';
          outSVG.data += inSVG[i].data;
          outSVG.data += '</svg>';
          ypos += inSVG[i].yup + inSVG[i].ydown;
        }

        break;
    }

    outSVG.data += "\n";

    if (myParent==0) { //We will always foresee a 20 pixel horizontal and 5 pixel vertical margin
      var header: string = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" transform=\"scale(1,1)\" width=\"" + (width + 20) + "\" height=\"" + (height + 5) + "\">";
      header += this.outputSVGDefs();
      var footer: string = "</svg>";
      outSVG.data = header+outSVG.data+footer;
    }

    return(outSVG);

  }

  //-----------------------------------------------------

  outputSVGDefs() {
    var output: string = `
    <defs>
    <pattern id="VerticalStripe"
      x="5" y="0" width="5" height="10"
      patternUnits="userSpaceOnUse" >
      <line x1="0" y1="0" x2="0" y2="10" stroke="black" />
    </pattern>
    <g id="batterij">
      <rect x="1" y="-12" width="40" height="27" stroke="black" fill="none"/>
      <rect x="6" y="-15" width="10" height="3" stroke="black" fill="none"/>
      <rect x="26" y="-15" width="10" height="3" stroke="black" fill="none"/>
      <line x1="9" y1="-5" x2="13" y2="-5" stroke="black"/>
      <line x1="11" y1="-7" x2="11" y2="-3" stroke="black"/>
      <line x1="29" y1="-5" x2="33" y2="-5" stroke="black"/>
    </g>
    <g id="ster">
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:black" />
      <line x1="-4.33" y1="-2.5" x2="4.33" y2="2.5" style="stroke:black" />
      <line x1="-4.66" y1="2.5" x2="4.33" y2="-2.5" style="stroke:black" />
    </g>
    <g id="EVlader">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <rect style="fill:black;stroke:black" width="18" height="6" x="12" y="-10" />
      <rect style="fill:black;stroke:black" width="28" height="10" x="6" y="-4" ry="0" />
      <circle cx="12" cy="6" r="4" style="stroke:black;fill:black" />
      <circle cx="28" cy="6" r="4" style="stroke:black;fill:black" />
      <line x1="20" y1="-7.2" x2="17" y2="-2" stroke="white"/>
      <line x1="17" y1="-2" x2="23" y2="-2" stroke="white"/>
      <line x1="23" y1="-2" x2="20" y2="3.2" stroke="white"/>
      <line x1="20" y1="3.2" x2="20" y2="0.2" stroke="white"/>
      <line x1="20" y1="3.2" x2="22.6" y2="1.7" stroke="white"/>
    </g>
    <g id="lamp">
      <line x1="-10.61" y1="-10.61" x2="10.61" y2="10.61" stroke="black" stroke-width="2" />
      <line x1="-10.61" y1="10.61" x2="10.61" y2="-10.61" stroke="black" stroke-width="2" />
    </g>
    <g id="led">
      <line x1="0" y1="-7" x2="0" y2="7" stroke="black" stroke-width="2" />
      <line x1="0" y1="-7" x2="12" y2="0" stroke="black" stroke-width="2" />
      <line x1="0" y1="7" x2="12" y2="0" stroke="black" stroke-width="2" />
      <line x1="12" y1="-7" x2="12" y2="7" stroke="black" stroke-width="2" />
      <line x1="6" y1="-6" x2="7" y2="-11" stroke="black" stroke-width="1" />
      <line x1="7" y1="-11" x2="8.11" y2="-9.34" stroke="black" stroke-width="1" />
      <line x1="7" y1="-11" x2="5.34" y2="-9.9" stroke="black" stroke-width="1" />
      <line x1="9" y1="-6" x2="10" y2="-11" stroke="black" stroke-width="1" />
      <line x1="10" y1="-11" x2="11.11" y2="-9.34" stroke="black" stroke-width="1" />
      <line x1="10" y1="-11" x2="8.34" y2="-9.9" stroke="black" stroke-width="1" />
    </g>
    <g id="sinus">
      <path d="M0,0 C2,-5 8,-5 10,0 S18,5 20,0" style="stroke:black;fill:none" />
    </g>
    <g id="spot">
      <path d="M0 0 A10 10 0 0 1 10 -10" stroke="black" fill="white" stroke-width="1" />
      <path d="M0 0 A10 10 0 0 0 10 10" stroke="black" fill="white" stroke-width="1" />
      <circle cx="10" cy="0" r="6" style="stroke:black;fill:white" />
      <line x1="5.76" x2="14.24" y1="-4.24" y2="4.24" stroke="black" stroke-width="1" />
      <line x1="5.76" x2="14.24" y1="4.24" y2="-4.24" stroke="black" stroke-width="1" />
    </g>
    <g id="noodlamp_decentraal">
      <rect x="-10.61" y="-10.61" width="21.22" height="21.22" fill="white" stroke="black" />
      <circle cx="0" cy="0" r="5" style="stroke:black;fill:black" />
      <line x1="-7" y1="-7" x2="7" y2="7" stroke="black" stroke-width="2" />
      <line x1="-7" y1="7" x2="7" y2="-7" stroke="black" stroke-width="2" />
    </g>
    <g id="signalisatielamp">
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
      <line x1="-3" y1="-3" x2="3" y2="3" stroke="black" />
      <line x1="-3" y1="3" x2="3" y2="-3" stroke="black" />
    </g>
    <g id="schakelaar_enkel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_dubbel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="8" y1="-16" x2="13" y2="-13.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_trippel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="8" y1="-16" x2="13" y2="-13.5" stroke="black" />
      <line x1="6" y1="-12" x2="11" y2="-9.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_wissel_enkel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="20" stroke="black" />
      <line x1="-10" y1="20" x2="-15" y2="17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_rolluik">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="-20" stroke="black" />
      <line x1="-10" y1="-20" x2="-15" y2="-17.5" stroke="black" />
      <rect x="-8" y="-8" width="16" height="16" fill="white" stroke="black" />
      <text x="0" y="6" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="16">S</text>
    </g>
    <g id="schakelaar_enkel_dim">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
      <polygon points="-1,-8 11,-8 11,-15" fill="black" stroke="black" />
    </g>
    <g id="schakelaar_wissel_dim">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="20" stroke="black" />
      <line x1="-10" y1="20" x2="-15" y2="17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
      <polygon points="-1,-8 11,-8 11,-15" fill="black" stroke="black" />
    </g>
    <g id="schakelaar_kruis_enkel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="20" stroke="black" />
      <line x1="-10" y1="20" x2="-15" y2="17.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="-20" stroke="black" />
      <line x1="-10" y1="-20" x2="-15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="10" y2="20" stroke="black" />
      <line x1="10" y1="20" x2="15" y2="17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_dubbelaansteking">
      <line x1="0" y1="0" x2="-10" y2="-20" stroke="black" />
      <line x1="-10" y1="-20" x2="-15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_wissel_dubbel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="8" y1="-16" x2="13" y2="-13.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="20" stroke="black" />
      <line x1="-10" y1="20" x2="-15" y2="17.5" stroke="black" />
      <line x1="-8" y1="16" x2="-13" y2="13.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="aansluitpunt">
      <circle cx="5" cy="0" r="5" style="stroke:black;fill:none" />
    </g>
    <g id="aftakdoos">
      <circle cx="15" cy="0" r="15" style="stroke:black;fill:none" />
      <circle cx="15" cy="0" r="7.5" style="stroke:black;fill:black" />
    </g>
    <g id="bewegingsschakelaar">
      <rect x="0" y="-13" width="10" height="26" fill="none" style="stroke:black" />
      <rect x="10" y="-13" width="30" height="26" fill="none" style="stroke:black" />
      <line x1="10" y1="13" x2="40" y2="-13"  stroke="black" />
      <line x1="15" y1="-5" x2="20" y2="-5"  stroke="black" />
      <line x1="20" y1="-10" x2="20" y2="-5"  stroke="black" />
      <line x1="20" y1="-10" x2="25" y2="-10"  stroke="black" />
      <text x="22" y="11" style="text-anchor:start" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="10">PIR</text>
    </g>
    <g id="schakelaar">
      <line x1="0" y1="0" x2="5" y2="0"  stroke="black" />
      <line x1="5" y1="0" x2="35" y2="-10"  stroke="black" />
      <line x1="35" y1="0" x2="40" y2="0"  stroke="black" />
    </g>
    <g id="schemerschakelaar">
      <line x1="0" y1="0" x2="5" y2="0"  stroke="black" />
      <line x1="5" y1="0" x2="35" y2="-10"  stroke="black" />
      <line x1="35" y1="0" x2="40" y2="0"  stroke="black" />
      <use xlink:href="#arrow" x="14" y="-17" transform="rotate(90 14 -17)" />
      <use xlink:href="#arrow" x="18" y="-17" transform="rotate(90 18 -17)" />
    </g>
    <g id="stopcontact">
      <path d="M20 0 A15 15 0 0 1 35 -15" stroke="black" fill="white" stroke-width="2" />
      <path d="M20 0 A15 15 0 0 0 35 15" stroke="black" fill="white" stroke-width="2" />
      <line x1="0" y1="0" x2="20" y2="0" stroke="black" />
    </g>
    <g id="stoomoven">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <path d="M 6 -2 A 7 5 0 0 1 13 -7 A 7 5 0 0 1 27 -7 A 7 5 0 0 1 33 -2" stroke="black" fill="none" />
      <path d="M 6  5 A 7 5 0 0 1 13  0 A 7 5 0 0 1 27  0 A 7 5 0 0 1 33  5" stroke="black" fill="none" />
      <path d="M 6 12 A 7 5 0 0 1 13  7 A 7 5 0 0 1 27  7 A 7 5 0 0 1 33 12" stroke="black" fill="none" />
    </g>
    <g id="stopcontact_aarding">
      <line x1="20" y1="-15" x2="20" y2="15"  stroke="black" stroke-width="2" />
    </g>
    <g id="stopcontact_kinderveilig">
      <line x1="35" y1="-20" x2="35" y2="-15"  stroke="black" stroke-width="2" />
      <line x1="35" y1="20" x2="35" y2="15"  stroke="black" stroke-width="2" />
    </g>
    <g id="bel">
      <path d="M20 0 A15 15 0 0 1 0 15" stroke="black" fill="none" stroke-width="2" />
      <path d="M20 0 A15 15 0 0 0 0 -15" stroke="black" fill="none" stroke-width="2" />
      <line x1="0" y1="15" x2="0" y2="-15" stroke="black" stroke-width="2" />
    </g>
    <g id="boiler">
      <circle cx="20" cy="0" r="20" style="stroke:black;fill:url(#VerticalStripe)" />
    </g>
    <g id="boiler_accu">
      <circle cx="20" cy="0" r="20" style="stroke:black;fill:none" />
      <circle cx="20" cy="0" r="15" style="stroke:black;fill:url(#VerticalStripe)" />
    </g>
    <g id="motor">
      <circle cx="20" cy="0" r="20" style="stroke:black;fill:none" />
      <text x="20" y="6" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="16">M</text>
    </g>
    <g id="elektriciteitsmeter">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <line x1="0" y1="-6" x2="40" y2="-6" stroke="black" stroke-width="1" />
      <text x="20" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="12">kWh</text>
    </g>
    <g id="diepvriezer">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <use xlink:href="#ster" x="10" y="0" />
      <use xlink:href="#ster" x="20" y="0" />
      <use xlink:href="#ster" x="30" y="0" />
    </g>
    <g id="zonnepaneel">
      <rect x="0" y="-12" width="80" height="30" fill="none" style="stroke:black" />
      <line x1="3" y1="3" x2="77" y2="3" stroke="black" />
      <line x1="20" y1="-9" x2="20" y2="15" stroke="black" />
      <line x1="40" y1="-9" x2="40" y2="15" stroke="black" />
      <line x1="60" y1="-9" x2="60" y2="15" stroke="black" />
    </g>
    <g id="drukknop">
      <circle cx="12" cy="0" r="12" style="stroke:black;fill:none" />
      <circle cx="12" cy="0" r="7" style="stroke:black;fill:none" />
    </g>
    <g id="teleruptor">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <line x1="8" y1="6" x2="16" y2="6"  stroke="black" />
      <line x1="24" y1="6" x2="32" y2="6"  stroke="black" />
      <line x1="16" y1="-6" x2="16" y2="6"  stroke="black" />
      <line x1="24" y1="-6" x2="24" y2="6"  stroke="black" />
    </g>
    <g id="dimmer">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <line x1="10" y1="5" x2="30" y2="6"  stroke="black" />
      <line x1="10" y1="5" x2="10" y2="-5"  stroke="black" />
      <line x1="10" y1="-5" x2="30" y2="5"  stroke="black" />
    </g>
    <g id="relais">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <line x1="10" y1="-13" x2="30" y2="13"  stroke="black" />
    </g>
    <g id="minuterie">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <text x="20" y="6" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="16">t</text>
    </g>
    <g id="thermostaat">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <circle cx="20" cy="0" r="8" style="stroke:black;fill:none" />
      <line x1="12" y1="0" x2="28" y2="0"  stroke="black" />
    </g>
    <g id="tijdschakelaar">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <circle cx="11" cy="0" r="8" style="stroke:black;fill:none" />
      <line x1="10" y1="0"  x2="17" y2="0"  stroke="black" />
      <line x1="11" y1="-6" x2="11" y2="1"  stroke="black" />
      <line x1="21" y1="0"  x2="25" y2="0"  stroke="black" />
      <line x1="25" y1="0"  x2="31" y2="-5"  stroke="black" />
      <line x1="31" y1="0"  x2="36" y2="0"  stroke="black" />
    </g>
    <g id="droogkast">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <circle cx="15" cy="-7.5" r="5" style="stroke:black;fill:none" />
      <circle cx="25" cy="-7.5" r="5" style="stroke:black;fill:none" />
      <circle cx="20" cy="7.5" r="3" style="stroke:black;fill:black" />
    </g>
    <g id="omvormer">
      <rect x="0" y="-15" width="60" height="30" fill="none" style="stroke:black" />
      <line x1="35" y1="-12" x2="25" y2="12" stroke="black" />
      <text x="15" y="-1" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="12">AC</text>
      <text x="45" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="12">DC</text>
    </g>
    <g id="overspanningsbeveiliging">
      <rect x="0" y="-15" width="15" height="30" fill="none" style="stroke:black" />
      <line x1="7.5" y1="-18" x2="7.5" y2="-5" stroke="black" />
      <line x1="7.5" y1="-5" x2="4.5" y2="-9" stroke="black" />
      <line x1="7.5" y1="-5" x2="10.5" y2="-9" stroke="black" />
      <line x1="7.5" y1="18" x2="7.5" y2="5" stroke="black" />
      <line x1="7.5" y1="5" x2="4.5" y2="9" stroke="black" />
      <line x1="7.5" y1="5" x2="10.5" y2="9" stroke="black" />
    </g>
    <g id="koelkast">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <use xlink:href="#ster" x="20" y="0" />"
    </g>
    <g id="kookfornuis">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <circle cx="10" cy="10" r="3" style="stroke:black;fill:black" />
      <circle cx="30" cy="10" r="3" style="stroke:black;fill:black" />
      <circle cx="30" cy="-10" r="3" style="stroke:black;fill:black" />
    </g>
    <g id="microgolf">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <use xlink:href="#sinus" x="10" y="-10" />"
      <use xlink:href="#sinus" x="10" y="0" />"
      <use xlink:href="#sinus" x="10" y="10" />"
    </g>
    <g id="oven">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <line x1="0" y1="-5" x2="40" y2="-5" stroke="black" />
      <circle cx="20" cy="7.5" r="3" style="stroke:black;fill:black" />
    </g>
    <g id="usblader">
      <rect x="0" y="-15" width="60" height="30" fill="none" style="stroke:black" />
      <circle cx="12" cy="-5" r="5" style="stroke:black;fill:none" />
      <circle cx="19" cy="-5" r="5" style="stroke:black;fill:none" />
      <text x="15" y="8" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="8">AC/DC</text>
      <text x="42" y="4" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="11">USB</text>
    </g>
    <g id="vaatwasmachine">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <line x1="0" y1="-20" x2="40" y2="20" style="stroke:black;fill:none" />
      <line x1="40" y1="-20" x2="0" y2="20" style="stroke:black;fill:none" />
      <circle cx="20" cy="0" r="8" style="stroke:black;fill:white" />
    </g>
    <g id="ventilator">
      <rect x="0" y="-15" width="30" height="30" fill="none" style="stroke:black" />
      <circle cx="10" cy="0" r="5" style="stroke:black;fill:none" />
      <circle cx="20" cy="0" r="5" style="stroke:black;fill:none" />
    </g>
    <g id="transformator">
      <circle cx="8" cy="0" r="8" style="stroke:black;fill:none" />
      <circle cx="20" cy="0" r="8" style="stroke:black;fill:none" />
    </g>
    <g id="verwarmingstoestel">
      <rect x="0" y="-15" width="50" height="30" fill="url(#VerticalStripe)" style="stroke:black" />
    </g>
    <g id="verwarmingstoestel_accu">
      <rect x="0" y="-15" width="50" height="30" fill="none" style="stroke:black" />
      <rect x="5" y="-10" width="40" height="20" fill="url(#VerticalStripe)" style="stroke:black" />
    </g>
    <g id="verwarmingstoestel_accu_ventilator">
      <rect x="0" y="-15" width="70" height="30" fill="none" style="stroke:black" />
      <rect x="5" y="-10" width="35" height="20" fill="url(#VerticalStripe)" style="stroke:black" />
      <circle cx="50" cy="0" r="5" style="stroke:black;fill:none" />
      <circle cx="60" cy="0" r="5" style="stroke:black;fill:none" />
    </g>
    <g id="verbruiker">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
    </g>
    <g id="wasmachine">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <circle cx="20" cy="0" r="3" style="stroke:black;fill:black" />
      <circle cx="20" cy="0" r="15" style="stroke:black;fill:none" />
    </g>
    <g transform="rotate(-20)" id="zekering_automatisch">
      <line x1="0" y1="-30" x2="0" y2="0"  stroke="black" />
      <rect x="-4" y="-30" width="4" height="10" style="fill:black" />
    </g>
    <g id="zekering_smelt">
      <rect x="-4" y="-30" width="8" height="30" style="stroke:black;fill:none" />
      <line x1="0" y1="-30" x2="0" y2="0" stroke="black" />
    </g>
    <g id="overspanningsbeveiliging_inline">   -> shift x -7.5  y -15
      <rect x="-7.5" y="-30" width="15" height="30" fill="none" style="stroke:black" />
      <line x1="0" y1="-30" x2="0" y2="-20" stroke="black" />
      <line x1="0" y1="-20" x2="-3" y2="-24" stroke="black" />
      <line x1="0" y1="-20" x2="3" y2="-24" stroke="black" />
      <line x1="0" y1="0" x2="0" y2="-10" stroke="black" />
      <line x1="0" y1="-10" x2="-3" y2="-6" stroke="black" />
      <line x1="0" y1="-10" x2="3" y2="-6" stroke="black" />
    </g>
    <g transform="rotate(-20)" id="zekering_empty">
      <line x1="0" y1="-30" x2="0" y2="0"  stroke="black" />
    </g>
    <g id="arrow">
      <line x1="0" y1="0" x2="8" y2="0" stroke="black" />
      <line x1="8" y1="0" x2="5" y2="-1" stroke="black" />
      <line x1="8" y1="0" x2="5" y2="1" stroke="black" />
    </g>
    <g id="gas_ventilator">
      <polygon points="-6,5.2 0,-5.2 6,5.2" fill="black" stroke="black" />
    </g>
    <g id="gas_atmosferisch">
      <polygon points="-6,5.2 0,-5.2 6,5.2" fill="white" stroke="black" />
    </g>
    <g id="bliksem">
      <line x1="0" y1="-5.2" x2="-3" y2="0" stroke="black"/>
      <line x1="-3" y1="0" x2="3" y2="0" stroke="black"/>
      <line x1="3" y1="0" x2="0" y2="5.2" stroke="black"/>
      <line x1="0" y1="5.2" x2="0" y2="2.2" stroke="black"/>
      <line x1="0" y1="5.2" x2="2.6" y2="3.7" stroke="black"/>
    </g>
    <g id="moving_man"
       transform="matrix(0.0152987,0,0,0.01530866,0,0)">
       <path
         d="M 710.7,10.1 C 904.8,5.2 908.6,261.4 730.9,278.4 637.5,287.3 566.3,181.5 603.8,90.8 623.4,43.4 668.7,12.9 711.4,10.1 c 1.1,-0.1 2.8,26.1 1.7,26.2 -31.4,2 -74.8,32.1 -89.1,74.7 -26.8,79.9 47,156.6 125.1,139.2 123.9,-27.6 114.1,-218.5 -36.3,-214 -0.7,0 -3.2,-26 -2.1,-26.1 z"
         id="path4" stroke="black" stroke-width="10" />
       <path
         d="m 545.3,225.9 c -67.8,-5 -133.2,0 -199.7,0 -20.7,13.6 -115,100.7 -121.1,121.1 -5.7,19.1 6.2,31.9 12.1,40.4 60.1,18.3 96.7,-60.4 133.2,-88.8 29.6,0 59.2,0 88.8,0 -59.2,78.9 -190.7,169.9 -58.5,264.3 -27.6,31.6 -55.1,63.2 -82.7,94.8 -46.9,-14.7 -165.6,-41.3 -199.7,-18.2 -7,21 -4.8,32.1 6.1,48.4 34.1,10.3 205.5,53.2 232,36.3 34.3,-37.7 68.6,-75.3 102.9,-113 32.3,27.6 64.6,55.2 96.9,82.7 -1,62.6 -14.6,249.9 24.2,266.3 10.2,3 19.1,0.5 28.2,-2 5.4,-7.4 10.8,-14.8 16.1,-22.2 6.9,-27 0.3,-272.6 -6.1,-282.5 -37.7,-32.9 -75.3,-65.9 -113,-98.9 1.3,-1.3 2.7,-2.7 4,-4 45.7,-48.4 91.5,-96.9 137.2,-145.3 20.2,19.5 40.4,39 60.5,58.5 16.7,35.8 152.2,25.4 179.6,6.1 2,-8.1 4,-16.1 6.1,-24.2 -16,-40.1 -71.7,-31.8 -127.1,-30.3 C 741.8,384.3 590.6,253 545.5,225.7 c -1.7,-1 14.9,-23.3 15.4,-22.4 -2.2,-3.5 126,97.7 134.4,107.4 9.4,9.1 55.2,51.5 82.1,78.4 68.5,-2 122,-6.5 137.2,46.4 4.9,17.1 1.9,37.1 -8.1,50.4 -18.8,25.3 -156,39.1 -197.7,18.2 -20.2,-20.2 -40.4,-40.4 -60.5,-60.5 -18.8,18.2 -37.7,36.3 -56.5,54.5 -16.8,18.2 -33.6,36.3 -50.4,54.5 32.9,28.9 65.9,57.8 98.9,86.8 11.2,17.9 18.9,272.3 8.1,306.7 -4.8,15.2 -19.9,32.9 -34.3,38.3 C 498.3,1028.1 527.8,798.3 529.4,706 505.9,686.5 482.3,667 458.8,647.5 427.9,676.7 402,732.8 362,750.4 333.5,762.9 140.3,728.4 113.8,712.1 100.1,703.6 89.3,686 85.6,667.7 59.7,543.2 281.5,646 321.3,617.4 334.7,601.3 348.2,585.1 361.7,569 266.4,454.2 335.5,414.9 402.1,326.9 c 0,-0.7 0,-1.3 0,-2 -8.1,0 -16.1,0 -24.2,0 -26.3,36.3 -124.9,147 -173.5,64.6 -35.9,-60.8 103.6,-172.2 141.1,-189.8 56.7,-3.8 167.5,-11 215.9,4 0.8,0.7 -14.9,22.6 -16.1,22.2 z"
         id="path6" stroke="black" stroke-width="10" /></g>
    </defs>
    `
    return(output);
  }

}
var CONFIGPAGE_LEFT:string = `
    <center>
        <p><font size="+2">
          <b>Eendraadschema ontwerpen: </b>
          Kies &eacute;&eacute;n van onderstaande voorbeelden om van te starten (u kan zelf kringen toevoegen achteraf) of
          start van een leeg schema met voorgekozen aantal kringen (optie 3).
        </font></p>
      <font size="+1">
        <i>
          <b>Tip: </b>Om de mogelijkheden van het programma te leren kennen is het vaak beter eerst een voorbeeldschema te
          bekijken alvorens van een leeg schema te vertrekken.
        </i>
      </font>
    </center><br><br>
    <table border="1px" style="border-collapse:collapse" align="center" width="100%">
      <tr>
        <td width="25%" align="center" bgcolor="LightGrey">
          <b>Voorbeeld 1</b>
        </td>
        <td width="25%" align="center" bgcolor="LightGrey">
          <b>Voorbeeld 2</b>
        </td>
        <td width="25%" align="center" bgcolor="LightGrey">
          <b>Leeg schema</b>
        </td>
        <td width="25%" align="center" bgcolor="LightGrey">
          <b>Openen</b>
        </td>
      </tr>
      <tr>
        <td width="25%" align="center">
          <br>
          <img src="examples/example000.svg" height="300px"><br><br>
          Eenvoudig schema, enkel stopcontacten en lichtpunten.
          <br><br>
        </td>
        <td width="25%" align="center">
          <br>
          <img src="examples/example001.svg" height="300px"><br><br>
          Iets complexer schema met teleruptoren, verbruikers achter stopcontacten en gesplitste kringen.
          <br><br>
        </td>
        <td width="25%" align="center">
          <br>
          <img src="examples/gear.svg" height="100px"><br><br>
`

var CONFIGPAGE_RIGHT:string = `
          <br><br>
        </td>
        <td width="25%" align="center">
          <br>
          <img src="examples/import_icon.svg" height="100px"><br><br>
          Open een schema dat u eerder heeft opgeslagen op uw computer (EDS-bestand). Enkel bestanden aangemaakt na 12 juli 2019 worden herkend.
          <br><br>
        </td>
      </tr>
      <tr>
        <td width="25%" align="center">
          <br>
          <button onclick="load_example(0)">Verdergaan met deze optie</button>
          <br><br>
        </td>
        <td width="25%" align="center">
          <br>
          <button onclick="load_example(1)">Verdergaan met deze optie</button>
          <br><br>
        </td>
        <td width="25%" align="center">
          <br>
          <button onclick="read_settings()">Verdergaan met deze optie</button>
          <br><br>
        </td>
        <td width="25%" align="center">
          <br>
          <button onclick="importclicked()">Verdergaan met deze optie</button>
          <br><br>
        </td>
      </tr>
    </table>
  `;

var CONFIGPRINTPAGE:string = `
<div>
</div>
<br>
`;

var EXAMPLE0 = `EDS0010000eJztXV1T2zgU/SuMnrW7sWxgwhtpmU4Huuws3ezOMh1G2ErQ+kMeW4Ytnf73lYUhTomhsITKzulDJ1iKZEs699xzbgJfSCKyub4ge96YkohrTvZOvxAZmQuU5LwQmSZ7I0pkFt2+DFWS8LwUps+MJ6WgJBafS/O+U6I/54JQcnJwdPDmo3mxz7MyqaSW2Zx8oqdkLjgvItMwOT4+Otj/lVBdVKJuiesJikshEzm/EHJlHx6GVVolXEvRbrY3Ydt5pnnSnp/ZWRMZXui4MDdxlqvF+He9RBaLxLbY7pfmQaWZRRUrZ7kWsajHao8QydlM1GslhUjsIDzNRcHndjU+/v7+13fmRTCyTTE/F0n7OvvX27EtGedpu+GtGdY2LI1/dlUv4tLI/qg19JlZhytxLecr19CuEWvfvHfz1CrR39wv80fTX1gwte2hSlNzA2bqdhfbVIpEhNprj1lqnkV2rxcd2GMd/O4O50ol3srtqFtYZ4u/sqXU9QZ69x/EXmcd1/171+sZgvszfKoxkpVVKooaFsT0OGxOzBIgvtIbpLEF0rwF0rwnIW2impV6bYh5rwQxXmmVmvsqw4tOgLEOgP01nWz57xjdXokyIKyPCPvNIubsvRYp2QNjgbGAp9dgrHv9LPEsup/kidTlEr3tLmDJFrBkS7CsN/sBVN6MPmQ8/h96mx4/RG/7buPxUFSxyIDK72Y5ZIvIFsFuyBaRLQJPg8oWOwa9yyP9ViK5u0Cs/yTEnmiVm3k0DzUI8FkE6AGxfUTsCgaEMIMwgzCDMBsGL7mNJuAIwgzCDHgaljC719Ke5m7QtypVWobcvPwghDlBhdi6FMV5Ucm4fuuqaSn5qftfPbQ9yRMlE1HYAyvyy0KK65ufCqXmMS+1fV3FcaZy8/IgEbFZ0FBqYWZJhbadm6uGkMSWMhC0qY+2wx8qkTTDHCoVz1SRVbK+36Ma2KEsQvOotz/mVVa//iDDQs1VMmvG+qBu8HycXqoitTOehBfcAN+csXqstiKl5GNhVtBMlDZh4I+TyVbCI/u+Kef6ipcpDy9kVgNm2g4YU1Fc8SI1i1dqJcqbJ5gW8h+xpUVsH+LP9pv/Vlkmcp4J2/Hh1b7d1uYZ92eax5FSdimEaGn0gEGjO5ALMQTvPgZvaHRodGh0aPTB8pLbaAKOoNGh0YEnaHRo9CFrdH8RvIOWqAieFL3bd41kaHjJ0JHM4rIrgl+reku3YnvoO4J4IczWlI5EcG97/TkRvC8nYAXvq5dJEbwveF/wvuB9DZaX3EYTcATvC94X8ATvC97XIL2vR47C42dgAHvf2uOuYzDIvW/8GQ/+zHcT9/ryYB/E3Ufihj8Dfwb+DPyZwfKS22gCjuDPwJ8BnuDPwJ8ZskYfQaM7kAsFCN59DN7Q6NDo0OjQ6IPlJbfRBBxBo0OjA0/Q6NDoA9bo/hga3YFcaBvBu4/BGxodGh0aHRp9sLzkNpqAI2h0aHTgCRodGn3AGn0HkuJlcqAmMHdICq8jB5q4HbTNEbWre7vBiN/QFdAVyIOgK1yjKOgK4OkH6ooGsGNkk+uG6sPc9wS8PgLXbxYKeEUeiTwSvNdHHCGPRB4JPPUoj2StL/fUOeXzPjn0APXdrR+4D9w3HKyu4j5IMkgywAmSDLQEWnIHR5BkkGTAUy8kGT4yhI8MLX1kiLWCNxs9988CDV9UrO+LCG/cjtsTHsU8XfqDP4jfj+gKOF6QFkiF4Hj1Q1TA8doYOMHxAi0BR3C8+kNOcLwGhyc4XgSOlxN/DOjbT6q00iPWyo+28TtuXjVN8hDX+xjXV+kNuMtwl+Euvyym4C5DxoOe4C73Q8DDXd4YOMFdBi0BR3CX+0NOcJcHhye4ywTuslvuMg4JDsnyh24DFBpcyJgZKL6PFI9CAwoNKDSsH1MoNMDRAT2h0NAPLweFho2BEwoNoCXgCIWG/pATCg2DwxMKDQQeMgoNOCROHpImUR6/RKFhaXndTZmj6vzc2ZzZd5vkT3Ip5k1eA65HxcENGYqKw4ZhChUHWDuQoqg49MPUQcVhY+CEigNoCThCxaE/5ISKw+DwhIoDgZmMigMOiZOHpCH4nQXD7zzXwUHBYYkx8UuUNofjV+TMO3ByXgZITULcUWbwOoA0cRtIJurb1b3dYGAKfg78HHAT/BzXKAp+DvA0XD+HQJKvQZKTp0jv3SFIb5cEA36rwAZFYyhvKG8obyhvKG9wUw9wBOUN5Q08QXlDef945e2zISjv/ic3jn/JDtEYyhvKG8obynsTycltSAFHUN5Q3sATlDeUdx+UtzlK5kblpTAba4XA2v4zM9VR/9SjjO5Sf5cGjAY+DTwajKg/pjvUG1M2osx0YJQFlI2pZy6avsy8Ny+UCXgmPpU1f8zMOcl4au6aCJFFBedRveEp/1lEJakPbFXUswXblKQqsv0is7df/wM24NvU`;

var EXAMPLE1 = `EDS0010000eJztnV1z2kYUhv+KR9dKiz6MY9/FbSbTcdJ06tTtNNPJrGGNVfTBCOG06fS/dyVks9jIIBqbXfH0okOQLIGO3n3PeV6w/3FimY6Ka+ck6LnOUBTCOfn4jxMNnRPPdSYil2nhnKhNUTq8fTjI4lhMplLtcyXiqXSdsfx7qn7uo1P8PZGO65y/fvv6uw/qwSuRTuNZVETpyPnD/eiMpBD5UG04ff/+7etXPzpukc9kuWVcniC/kVEcja5ltHIfMRjMklksikjqm6sXUW0XaSFi/fx+ddY4GlwX41y9iE+TbHH8u71kOpZxtaXa/Ua90UidJctXnuWLHMvyWPoRhtHVlSyvVSRlXB1EJBOZi1F1NT78/MOPb9SDsFdtGotLGevP+395/WpLKkSib/heHbbasHT8T5/Li7h05KCnHfqTug6f5ZdotPIaVtfI11+8N3/XWVzce71+0Lv41g8vqu2DLEnUC1Cn1nepNk1lLAeFpx9zWoh0WNV6sYO/boegeYfLLIu9leUot/iNW4KVW6ZFWUDv4Rupnvcbng8ePF+eIXx4hj9KjaTTWSLzUhaO2uOsvmOWBPGvO1eav1Cat1Ca10ppp1l9pZ5bYt4zSUzMiixRr2s6uG4UmN8gsN8uTg+CN757uFJlKMxGhf1UKebTD4VMnBMcC8dCT8/hWA/2q4xnsfv5JI6K6ZK9HS1k6S9k6S/Jsiz2I6qcH73Levw/9nbx/jF7e2W2Hs+EupkOPGS5sc3RLtIuYm+0i7SL6KlT7WLDQe8ayZcLwR4tBBu0Eqx2QtwP99sTta5wP6YypjKmMqYyfAlfMklHTGVMZejJiqnswRb9NHcH/T5LsiIaCPXwnZTqDsrlwY3ML/NZNC5/dNVpXefFixflIao79jSLYplXN6ac3OSR/DL/V55lo7GYFtXj2XicZhP18HUsx+rCDaJCqqMlsqh2rp9VxiMPMiW18rRqU3n4s0zG9WHOsmx8leXpLCpf19tSwIMoH6i3dPvPySwtH7+LBnk2yuKr+ljvsrlu3yc3WZ5UZzwfXAslcHUvlcc6L7KJulyFGJQ//iFXV0qdKKnl/sv56UEshtXPXQhRfBbTRAyuo7QUxoW+MFzI/LPIE3WRpkUmp/N3cJFHf8qDQo6rN/Gr/sO/Z2kqJyKV1Y7zq3pbpvq9vLoqxHiYZdVbllIbuI8Xa/HLxVocMiPoRxhJdQcY2czcuzisvs/fzYCsGA0QE8gKZAWyMk5PICt8CV8CWYGs0BPICmRlN7Ja9+kRT1umjxfL9GG7WVy7JnQ923Q9Hsu0jcv0irYHOgwdRkHQYbv9CDvqiJigw9DhZiFBh9vqCTqML+FL0GHoMHqCDkOHu0qHKXpni14bcAD439iBn66h9XFgGx0Y8L+dkAD/KAjwb7AfYUcdERPgH/DfLCTAf1s9Af7xJXwJ8A/4R0+Afxiw3QyYou9h0ecGHGiYpQwBbi2438qCl68VPS097b548KqelizNBD2RpXVFUGRpZGkoiCzNbj/CjjoiJrI0srRmIZGltdUTWRq+hC+RpZGloSeyNGIVu2MVik7R75d2fU0tqqVWs6ayWl3LupnyOxDi2DDsPz6cBHRTNnZThDjbCYkQBwUR4hjsR9hRR8REiEOI0ywkQpy2eiLEwZfwJUIcQhz0RIgDz7ebAVP0PSx6/YWocAPwv2YyXFlzGtttGtsQJ7bRiQkAthMSAQAKIgAw2I+wo46IiQCAAKBZSAQAbfVEAIAv4UsEAAQA6IkAABZsNwum6HtY9DoAOFw4cBkGbPcb0fQLYW5HO5xdXu5vS9vDgJ+hoSVQM0pVBGpdERaBGoEaCiJQs9uPsKOOiIlAjUCtWUgEam31RKCGL+FLBGoEauiJQI1sxe5shaJT9KUqWlSm/fiNZ0H/q+Se/N0aBo89bJQIPk3XFcFnV4RF8EnwiYIIPu32I+yoI2Ii+CT4bBYSwWdbPRF84kv4EsEnwSd6IvgkA7M7XKHoFJ3g08wy1X1SD54MT6Y1gicztzNn7F5M8GR4MjwZnowv4Usm6QieDE9GT/Bks5nV3qHFu6LXq7T268u8nq1/udz+tueQddrGdXpV3wMfhg8jIfiw3YaEH3VETPBh+HCzkODDbfUEH8aX8CX4MHwYPcGH4cNd5cMUvbNFrw04BP2b0NH2sWAbLRj0v6WSQP9ICPRvsCHhRx0RE+gf9N8sJNB/Wz2B/vElfAn0D/pHT6B/KLDdFJii72HR5wbcZzD8Oo1s7a4Ng6HX0Miemu2888HQx4AZDBkMaWQZDI20JwZD9LTDwbAW7DGd5FNL9XHva6HXNXIl/d65/9FH0keiI/pIe8yJPrJzetpFH+lrn5z0jrf94Ncj1nd3/fA+vK87Wl3lfYxkjGTIiZEMW8KWzNERIxkjGXqyYiR74o//NP3n8LGgJ/hY0CNXe+OPC/na4u33+GLjE3RBj3+T5Duzl+1TMRyXnxli+d58rAB4MVnQCQG87JgpAF57IyeAF7aEjgBe9pgTwKtzegJ4OQCvXQCvtR9U0doj3+OX5u2qTfJY121c11fNG8Bl4DJwGbjcJXsyW1JICbhs0PwOXN4bOQGXsSV0BFy2x5yAy53TE3DZAS6bBZe5SbhJlj5yGxxvkjOsGTyJGf5vw+zj8DY6PDEDMUNLKREztJcUMQM8B3ciZrCD5BAz7I2ciBmwJXREzGCPOREzdE5PxAwOBJmYgZvEyJtkbvChhnACDeH0W1m8/qrpmLvXMWv3YYPXf8nKuh6Mqzu/we5zqeozNcTrw8On757J8IzQFhmele0zGR4ZXkspkeG1lxQZHq0f7kSGZwcmJcPbGzmR4WFL6IgMzx5zIsPrnJ7I8BziGTI8bhI7bpLlW2H9PXCv9ibXWKtlU7kNrfFmtayHno0io3Xt2tJlNHf8Gc4uL42dfwIaNhsbNlIjUqOWUiI1ai8pUiPwHO5EamQHmCM12hs5kRphS+iI1MgecyI16pyeSI0cAgEjAgFuEm6ShqShr82d4bbf/Lr3zSAaZhpmDP7O4OtWWlNav4mVriE8K1djFLeN4vjLUVZKbsWM2oecfh0h1QNoQ6znNQjp1GwhnZWZ3oGPnmCndhiT2XJCR7BT2Cl6MmS0soOdOuCvHX+gNtQWY6/f9OG/dauxfiHMbW6M/jztk6/GPdbi5+htgFkmqQqY1RVhAbOAWcAsYFZHjMlsOaEjYBYwCz0Bs4BZVsCsB6XVqmhRmfbjS/yh/zWY4+K60YHSgd7t8EYquWxnlrdvxUyvBDaarihgo5VNKLAR2AhsBDZ215jMlhM6AjYCG9ETsBHYaAXFAjZaUaYaNgbARjpQ82Bjs1nqGNKk3hPYaJKigI1WNqHARmAjsBHY2F1jMltO6AjYCGxET8BGYKMVFAvYaEWZass82oCRbMQad/nXiUya6bbrQX1M00bTBI4AR4AjwBHgCL5kuI6AI8AR9AQcMXvq7jocma/Fgd+FqXuz5kZdSZnPJuVVNq654U8CW7kaM3UzdTN1M3UzdeNLhuuIqZupGz0xdTN173DqVreSeqHRjVSFrYYA0/6nXmBpFh8913eP3Jfuset5rhe4wUvX890gdINDN+i7Xs/1Dl0vdNXDY9fvub76AbX92A3VY/WMer7vhp4b+m4YuN6RG/jq0JM8U8uoWvWmpStdqbsvVf2wc+JImQ5zIYblbZSIb+Rw6pQymOXV15BC10myYbXfUN0x//4HW3iVlg==`;

var EXAMPLE_DEFAULT = `EDS0010000eJztXGtT2zgU/SsZfzbb+AEsfCMt0+nw2tmw2Z1lOoywbxKtH/LIctjS6X9fSQnEKUlpsoXa4XxhjCVfPa6P7j3nGj47KeUjNXYOva7rxEwx5/Dqs8NjfcN1CiYpV86hbuJ5fH8ZiTRlRUm6z5ClJblOQp9K/dyVoz4V5LhO//j0+O2lvjhieZlWXPF85Hx0r5wRMSZj3dC7uDg9Pjp3XCUrMi2JGUBOiKd8NCa+tA+LoiqrUqY41ZvtJGw7yxVL6+P7dtSUR2OVSD2J60LM7T/0ojyh1LbY7hO9UK5HEXLpKHeUkLFVtxDz4ZDMXnGi1BphWUGSjexuXP7+4fy9vgi7tilhN5TW7/v/enu2JWcsqze802Ztw4L961uziQuWg27N9LXeh1u646Ole2j3yK9P3puuWqTqq/n6QXfwxg8Htj0SWaYnoIeud7FNJaUUKa9us1Qsj62v5x38pzoEqzvcCJF6S91hWvyVLcHSllIZB3qPF2Lv+yvuB4/umxHCxyN8NBjJyyojaWDh6B4nszdmARBf3CnSwr051Lw51Ly1oNYTs616aYx5L4QxVimR6XmV0XglwvwVCPtr0OsE7313dynMALE2Quw3i5jrD4oy5xAhCyELeHqJkPWonw088+79IuWqXIxv+3Ncmlh3D0x/LWBOB9hmSD5fhDtqJyTP3xy9UjAuCW7IEpElIqohS0SWCDxtV5a4wug8f/TniN2fIzZYC7F9JQo9jmKRQgDcKAD6QGwbEbskAtb4mL+KjhkvgY1tCKTBRYvZ2AlVCeWA03fDyQcxAzFDWAIxe8HoBGIGPP1EYvaopT7Mg9F3IhOKR0xfnhHpN0hSZ0LyRlY8MY8uG9Z1dnZ2jAn7xvYET0naF5OKieR0N/1NCjFKWKnsdZUkuSj05XFKid64iCvS1jJStvPsrg481BEaajbFUdb8iaB0ZuZEiGQoZF5xM69TA+CIy0gv6f7XosrN9RmPpBiJdDizdSamuL3IJkJmdsR+NGYa4PpdMrbqzNN1LqXeKT1QNoP7H/1eJ2WxfW7AmLplZcaiMc8NMAb1g2FA8pbJTG9SqQSV0xUMJP+HOooSu4g/6w//LfKcCpaT7Tjd1Xs3zdZyNFQsiYWwSyaqc+6gVrOpkYRwrdO4PjskN9uX3JzyPClXnch3wri0k9iXe8WhLEm7pmzIieztvkAVB1pWE2AFLauVSQ60LGhZ0LKgZW1tXGo2moAjaFnQsoAnaFnQslqhZT3h2qd92iJf1ny2yq2t9uVMP+lCP/nuwPp8eWqIwNrGwAr9BPoJ9BPoJ1sbl5qNJuAI+gn0E+AJ+gn0kxZxbj+scYRaVrML0o2PFnAab8ISaumN39306zrw7s1599tmY6nH4oRlC9/NAVNPYKqmDHsHm0rD3+DeD8tDfAL53mooGfhAFH5e2v1tKK3BvZ9A01cbBThBE0ZYQlhqI46gCUMTBp6gCUMTbtQ3dXD69jt9lsge/IhCwMI2Njeljaubm8bmtEGzg3C/4DSa5R2IxagINIMmoiLwyjCFigCkF1BFVATaIbqgIvBq4ISKAMIScISKQHuCEyoCW4cnVAQgDqMiAKf/n4qAV/vz4b1NFZafXhBog3iJPw3YwhC8JKXdg9DyY4A0y1dXVAG8FUDqNRtI+nC3u3vvYGAKckvjg1OzIQUcQW6B3AI8QW4B824R8w78bWDe7U9uGv4lHk5jMG8wbzBvMO/XGJyaDSngCMwbzBt4AvMG824D89avkp4on5B2rCUC6/zQD5uD/Mpzwz033HdD3w0DN+y6fuj6B6637wa+7lNIoc8qfbSU5ugfahfnLNMDOjENWZWqXyguHfOSVdL+O/xfXScTselAsfbHl/8ACuXiVQ==`
var VERSION = "git"; //can be "git" or "online"

var PROP_Contact_Text = `<html>
  <head>
    <title>Eendraadschema online</title>
    <link rel="stylesheet" href="css/about.css">
  </head>
  <body>
    <h2>Een &eacute;&eacute;ndraadschema tekenen.</h2>
    <p class="ondertitel">Een cr&eacute;atie van <a target="_blank" href="https://ivan.goethals-jacobs.be">Ivan Goethals</a></p>
    <p>Dit is een standalone versie (development) waarbij enkele functionaliteiten zijn uitgeschakeld.</p>
    <p>Gebruik de online versie op <a href="https://eendraadschema.goethals-jacobs.be">https://eendraadschema.goethals-jacobs.be</a> om toegang te krijgen tot het contactformulier.</p>
    <p>Kies <b>Bewerken</b> in het menu om verder te gaan met tekenen.</p>
  </body>
</html>`

function PROP_GDPR() {
  return("");
}

function PROP_getCookieText() {
  return("");
}

function exportjson() {
  var filename:string;

  //We use the Pako library to entropy code the data
  //Final data reads "EDS0010000" and thereafter a 64base encoding of the deflated output from Pako
  //filename = "eendraadschema.eds";
  filename = structure.properties.filename;

  var text:string = JSON.stringify(structure);
  try {
    var decoder = new TextDecoder("utf-8");
    var encoder = new TextEncoder();
    var pako_inflated = new Uint8Array(encoder.encode(text));
    var pako_deflated = new Uint8Array(pako.deflate(pako_inflated));
    text = "EDS0010000" + btoa(String.fromCharCode.apply(null, pako_deflated));
  } catch (error) {
    //We keep the non encoded text and do nothing
  } finally {
    download_by_blob(text, filename, 'data:text/eds;charset=utf-8');
  }
}

function displayButtonPrintToPdf() {
  return("");
  //Does nothing in the serverless version, only used on https://eendraadschema.goethals-jacobs.be
}

function handleButtonPrintToPdf() {
  return(0);
  //Does nothing in the serverless version, only used on https://eendraadschema.goethals-jacobs.be
}
function HLCollapseExpand(my_id: number, state?: Boolean) {
  var ordinal: number;
  ordinal = structure.getOrdinalById(my_id);
  if (state == undefined) {
    structure.data[ordinal].collapsed = !structure.data[ordinal].collapsed;
  } else {
    structure.data[ordinal].collapsed = state;
  }
  HLRedrawTree();
}

function HLDelete(my_id: number) {
  structure.deleteById(my_id);
  HLRedrawTree();
}

function HLAdd(my_id: number) {
  structure.addItem(new Electro_Item());
  HLRedrawTree();
}

function HLInsertBefore(my_id: number) {
  structure.insertItemBeforeId(new Electro_Item(), my_id);
  HLRedrawTree();
}

function HLInsertAfter(my_id: number) {
  structure.insertItemAfterId(new Electro_Item(), my_id);
  HLRedrawTree();
}

function HLMoveDown(my_id: number) {
  structure.moveDown(my_id);
  HLRedrawTree();
}

function HLMoveUp(my_id: number) {
  structure.moveUp(my_id);
  HLRedrawTree();
}

function HLClone(my_id: number) {
  structure.clone(my_id);
  HLRedrawTree();
}

function HLInsertChild(my_id: number) {
  structure.insertChildAfterId(new Electro_Item(), my_id);
  HLCollapseExpand(my_id, false);
  //No need to call HLRedrawTree as HLCollapseExpand already does that
}

function HLUpdate(my_id: number, key: string, type: string, docId: string) {
  switch (type) {
    case "SELECT":
      var setvalueselect: string = (document.getElementById(docId) as HTMLInputElement).value;
      structure.data[structure.getOrdinalById(my_id)].setKey(key,setvalueselect);
      HLRedrawTreeHTML();
      break;
    case "STRING":
      var setvaluestr: string = (document.getElementById(docId) as HTMLInputElement).value;
      structure.data[structure.getOrdinalById(my_id)].setKey(key,setvaluestr);
      break;
    case "BOOLEAN":
      var setvaluebool: boolean = (document.getElementById(docId) as HTMLInputElement).checked;
      structure.data[structure.getOrdinalById(my_id)].setKey(key,setvaluebool);
      HLRedrawTreeHTML();
      break;
  }
  HLRedrawTreeSVG();
}

function HL_editmode() {
  structure.mode = (document.getElementById("edit_mode") as HTMLInputElement).value;
  HLRedrawTreeHTML();
}

function HL_changeparent(my_id: number) {
  //-- See what the new parentid is --
  let str_newparentid = (document.getElementById("id_parent_change_"+my_id) as HTMLInputElement).value;

  //-- Check that it is valid. It needs to be a number and the parent an active component --
  let error = 0;
  let parentOrdinal = 0;
  if (!isInt(str_newparentid)) { error=1; }
  let int_newparentid = parseInt(str_newparentid);
  if (int_newparentid != 0) {
    parentOrdinal = structure.getOrdinalById(int_newparentid);
    if (typeof(parentOrdinal) == "undefined") {error=1; } else {
      if (!structure.active[parentOrdinal]) {error=1; }
    }
  }

  if (error == 1) {
    alert("Dat is geen geldig moeder-object. Probeer opnieuw.")
  } else {
    structure.data[structure.getOrdinalById(my_id)].parent = int_newparentid;
    structure.data[structure.getOrdinalById(my_id)].Parent_Item = structure.data[parentOrdinal];
  }

  structure.reSort();

  HLRedrawTree();
}

function HL_cancelFilename() {
  document.getElementById("settings").innerHTML = '<code>' + structure.properties.filename + '</code>&nbsp;<button onclick="HL_enterSettings()">Wijzigen</button>&nbsp;<button onclick="exportjson()">Opslaan</button>';
}

function HL_changeFilename() {
  var regex:RegExp = new RegExp('^[-_ A-Za-z0-9]{2,}\\.eds$');
  var filename = (document.getElementById("filename") as HTMLInputElement).value;
  if (regex.test(filename)) {
    structure.properties.setFilename((document.getElementById("filename") as HTMLInputElement).value);
    document.getElementById("settings").innerHTML = '<code>' + structure.properties.filename + '</code><br><button onclick="HL_enterSettings()">Wijzigen</button>&nbsp;<button onclick="exportjson()">Opslaan</button>';
  }
}

function HL_enterSettings() {
  document.getElementById("settings").innerHTML = '<input type="text" id="filename" onchange="HL_changeFilename()" value="" pattern="^[-_ A-Za-z0-9]{2,}\\\.eds$">&nbsp;<i>Gebruik enkel alphanumerieke karakters a-z A-Z 0-9, streepjes en spaties. <b>Eindig met ".eds"</b>. Druk daarna op enter.</i><br><button onclick="HL_cancelFilename()">Annuleer</button>&nbsp;<button onclick="HL_changeFilename()">Toepassen</button>';
}

function HLRedrawTreeHTML() {
  show2col();
  document.getElementById("configsection").innerHTML = "";
  document.getElementById("left_col_inner").innerHTML = structure.toHTML(0);
}

function HLRedrawTreeSVG() {
  document.getElementById("right_col_inner").innerHTML = '<b>Tekening: </b><button onclick=download("html")>Download als html</button>';
  document.getElementById("right_col_inner").innerHTML += '&nbsp;<button onclick=download("svg")>Download als svg</button>';
  document.getElementById("right_col_inner").innerHTML += '&nbsp;<input type="checkbox" id="noGroup" checked></input><small>SVG elementen niet groeperen (aanbevolen voor meeste tekenprogramma\'s)</small>';
  document.getElementById("right_col_inner").innerHTML += '<br><small><i>Noot: De knoppen hierboven laden enkel de tekening. Wenst u het schema ook later te bewerken, gebruik dan "Opslaan" in het hoofdmenu.</i></small><br><br>';

  document.getElementById("right_col_inner").innerHTML += flattenSVGfromString(structure.toSVG(0,"horizontal").data);
  document.getElementById("right_col_inner").innerHTML += `
    <h2>Legend:</h2>
    <button style="background-color:green;">&#9650;</button> Item hierboven invoegen (zelfde niveau)<br>
    <button style="background-color:green;">&#9660;</button> Item hieronder invoegen (zelfde niveau)<br>
    <button style="background-color:green;">&#9654;</button> Afhankelijk item hieronder toevoegen (niveau dieper)<br>
    <button style="background-color:red;">&#9851;</button> Item verwijderen<br>
  `;

  document.getElementById("right_col_inner").innerHTML += '<i><br><small>Versie: ' + CONF_builddate +
                          ' (C) Ivan Goethals -- <a href="license.html" target="popup" onclick="window.open(\'license.html\',\'popup\',\'width=800,height=600\'); return false;">GPLv3</a></small></i><br><br>';

}

function HLRedrawTree() {
  HLRedrawTreeHTML();
  HLRedrawTreeSVG();
}

function buildNewStructure(structure: Hierarchical_List) {

  //Paremeterisation of the electro board
  let aantalDrogeKringen: number = CONF_aantal_droge_kringen;
  let aantalNatteKringen: number = CONF_aantal_natte_kringen;;

  //Eerst het hoofddifferentieel maken
  let itemCounter:number = 0;
  structure.addItem(new Electro_Item());
  structure.data[0].setKey("type","Aansluiting");
  structure.data[0].setKey("naam","");
  structure.data[0].setKey("zekering","differentieel");
  structure.data[0].setKey("aantal",CONF_aantal_fazen_droog);
  structure.data[0].setKey("amperage",CONF_hoofdzekering);
  structure.data[0].setKey("kabel",CONF_aantal_fazen_droog+"x16");
  structure.data[0].setKey("kabel_aanwezig",false);
  structure.data[0].setKey("differentieel_waarde",CONF_differentieel_droog);
  itemCounter++;

  //Dan het hoofdbord maken
  structure.insertChildAfterId(new Electro_Item(structure.data[itemCounter-1]),itemCounter);
  structure.data[itemCounter].setKey("type","Bord");
  itemCounter++;
  let droogBordCounter:number = itemCounter;

  //Nat bord voorzien
  structure.insertChildAfterId(new Electro_Item(structure.data[itemCounter-1]),itemCounter);
  structure.data[itemCounter].setKey("type","Kring");
  structure.data[itemCounter].setKey("naam","");
  structure.data[itemCounter].setKey("zekering","differentieel");
  structure.data[itemCounter].setKey("aantal",CONF_aantal_fazen_nat);
  structure.data[itemCounter].setKey("amperage",CONF_hoofdzekering);
  structure.data[itemCounter].setKey("kabel","");
  structure.data[itemCounter].setKey("kabel_aanwezig",false);
  structure.data[itemCounter].setKey("differentieel_waarde",CONF_differentieel_nat);
  itemCounter++;
  structure.insertChildAfterId(new Electro_Item(structure.data[itemCounter-1]),itemCounter);
  structure.data[itemCounter].setKey("type","Bord");
  structure.data[itemCounter].setKey("geaard",false);
  itemCounter++;

  //3 kringen toevoegen aan nat bord
  let natBordCounter:number = itemCounter;
  for (var i=0; i<aantalNatteKringen; i++) {
    structure.insertChildAfterId(new Electro_Item(structure.data[natBordCounter-1]),natBordCounter);
    structure.data[structure.getOrdinalById(itemCounter+1)].setKey("type","Kring");
    structure.data[structure.getOrdinalById(itemCounter+1)].setKey("naam",aantalDrogeKringen+aantalNatteKringen-i);
    itemCounter++;
  };

  //7 droge kringen toevoegen aan droog bord
  for (var i=0; i<aantalDrogeKringen; i++) {
    structure.insertChildAfterId(new Electro_Item(structure.data[structure.getOrdinalById(droogBordCounter)]),droogBordCounter);
    structure.data[structure.getOrdinalById(itemCounter+1)].setKey("type","Kring");
    structure.data[structure.getOrdinalById(itemCounter+1)].setKey("naam",aantalDrogeKringen-i);
    itemCounter++;
  }
}

function reset_all() {
  structure = new Hierarchical_List();
  buildNewStructure(structure);
  HLRedrawTree();
}


function doprint() {

  var prtContent = document.getElementById("printarea");
  var WinPrint = window.open();

  var prtStr = `
  <html>
    <head>
    <style type="text/css">
    @media print {
      .header, .hide { visibility: hidden }
    }
    @page
    {
	    size: landscape;
	    margin: 0cm;
      body { margin: 2cm; }
    }
    </style>
    <style type="text/css" media="print">
    @page
    {
	    size: landscape;
	    margin: 0cm;
      body { margin: 2cm; }
    }
    </style>
    </head>
    <body>`
    + prtContent.innerHTML + '</body></html>';

  WinPrint.document.write(prtStr);
  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
  WinPrint.close();
}

function dosvgdownload() {
  var prtContent = document.getElementById("printsvgarea").innerHTML;
  var filename = (document.getElementById("dosvgname") as HTMLInputElement).value;
  download_by_blob(prtContent, filename, 'data:image/svg+xml;charset=utf-8'); //Was text/plain
}

function renderAddress() {
  var outHTML: string = "";

  outHTML = '<div align="left">' +
            '<div style="display:inline-block; width:25px;"></div><div style="display:inline-block;"><table cols="3" rows="1" style="border-collapse: collapse;border-style: solid; border-width:medium;" cellpadding="5">' +
            '  <tr><th style="text-align: left;border-style: solid; border-width:thin;">Plaats van de elektrische installatie</th><th style="text-align: left;border-style: solid; border-width:thin;">Installateur</th><th style="text-align: left;border-style: solid; border-width:thin;">Info</th></tr>' +
            '  <tr>' +
            '    <td style="border-style: solid; border-width:thin;" contenteditable="true" valign="top" id="conf_owner" onkeyup="javascript:changeAddressParams()">' + structure.properties.owner + '</td>' +
            '    <td style="border-style: solid; border-width:thin;" contenteditable="true" valign="top" id="conf_installer" onkeyup="javascript:changeAddressParams()">' + structure.properties.installer + '</td>' +
            '    <td style="border-style: solid; border-width:thin;" contenteditable="true" valign="top" id="conf_info" onkeyup="javascript:changeAddressParams()">' + structure.properties.info + '</td>' +
            '  </tr>' +
            '</table></div></div>';

  return outHTML;
}

function getPrintSVGWithoutAddress() {
  var outSVG = new SVGelement();
  outSVG = structure.toSVG(0,"horizontal");

  var scale = 1;
  var height = outSVG.yup + outSVG.ydown;
  var startx = parseInt((document.getElementById("printoffset") as HTMLInputElement).value);
  var width = parseInt((document.getElementById("printwidth") as HTMLInputElement).value);

  var viewbox = '' + startx + ' 0 ' + width + ' ' + height;

  var outstr = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" transform="scale(1,1)" style="border:1px solid white" ' +
             'height="' + (height*scale) + '" width="' + (width*scale) + '" viewBox="' + viewbox + '">' +
             flattenSVGfromString(outSVG.data) + '</svg>';

  return(outstr);
}

function renderPrintSVG() {
  document.getElementById("printarea").innerHTML = '<div id="printsvgarea">' +
                                                      getPrintSVGWithoutAddress() +
                                                   '</div>' + '<br><br>' + renderAddress();
}

function changePrintParams() {
  renderPrintSVG();
}

function changeAddressParams() {
  structure.properties.owner = (document.getElementById("conf_owner") as HTMLElement).innerHTML;
  structure.properties.installer = (document.getElementById("conf_installer") as HTMLElement).innerHTML;
  structure.properties.info = (document.getElementById("conf_info") as HTMLElement).innerHTML;
}

function printsvg() {
  var strleft: string = "";

  var outSVG = new SVGelement();
  outSVG = structure.toSVG(0,"horizontal");

  var scale = 1;
  var startx = 0
  var height = outSVG.yup + outSVG.ydown;
  var width = outSVG.xleft + outSVG.xright;

  strleft += '<br><table border="0"><tr><td style="vertical-align:top;">';
  strleft += '<table border="1" cellpadding="3"><tr><th align="left">Eigenschap</th><th align="right">Standaard</th><th align"left">Instelling</th></tr>'
          +  '<tr><td>Hoogte in pixels</td><td align="right">' + height + '</td><td>Niet instelbaar</td></tr>'
          +  '<tr><td>Breedte in pixels</td><td align="right">' + width + '</td><td><input size="4" type="number" min="0" step="1" max="' + width + '" id="printwidth" onchange="changePrintParams()" value="' + width + '"></td></tr>'
          +  '<tr><td>Offset</td><td align="right">' + (0) + '</td><td><input size="4" type="number" min="0" step="1" max="' + width + '" id="printoffset" onchange="changePrintParams()" value="' + startx + '"></td></tr></table><br>'
  strleft += '</td><td style="vertical-align:top;padding:5px">';
  strleft += 'Deze pagina biedt enkele faciliteiten om het schema te printen zonder gebruik te maken van een schermafdruk (screenshot) of een '
          +  'externe convertor zoals beschreven in de documentatie (zie menu). De faciliteiten op deze pagina zijn experimenteel. Laat ons weten wat er al dan niet werkt '
          +  'via het contactformulier.'
          +  '<br><br>'
          +  'Op deze pagina kiest u &eacute;&eacute;n welbepaald segment (&eacute;&eacute;n pagina) uit uw schema door de parameters "offset" en "breedte" in de links te wijzigen. '
          +  'Geef eveneens in de tabel helemaal onderaan de pagina uw adresgegevens in. '
          +  'Klik daarna op &eacute;&eacute;n van de knoppen om het via offset en breedte geselecteerde deel van het schema te printen of exporteren.'
          +  '<br><br><button onclick="HLRedrawTree()">Sluiten en terug naar schema bewerken</button>'
  strleft += '</td></tr></table>'

  strleft += '<table border="0"><tr><td style="vertical-align:top"><button onclick="doprint()">Print voorbeeld onder de lijn</button></td><td>&nbsp;&nbsp;</td>' +
             '<td style="vertical-align:top">Print tekening hieronder vanuit uw browser. Opgelet, in de meeste browsers moet u zelf "landscape" en eventueel schaling naar paginagrootte (fit-to-page) instellen.</td></tr></table><br>'
  strleft += '<table border="0"><tr><td style="vertical-align:top"><button onclick="dosvgdownload()">Download SVG</button></td><td>&nbsp;</td><td style="vertical-align:top"><input id="dosvgname" size="20" value="eendraadschema_print.svg"></td><td>&nbsp;&nbsp;</td><td>Sla tekening hieronder op als SVG en converteer met een ander programma naar PDF (bvb Inkscape). <b>Adresgegevens worden niet opgenomen in de SVG!</b></td></tr></table><br>'
  strleft += displayButtonPrintToPdf();

  strleft += '<hr><div id="printarea"></div>';

  document.getElementById("configsection").innerHTML = strleft;
  renderPrintSVG();

  hide2col();
}

function exportscreen() {
  var strleft: string = "";

  strleft += '<table border=0><tr><td width=500 style="vertical-align:top;padding:5px">';
  strleft += 'Bestandsnaam: <span id="settings"><code>' + structure.properties.filename + '</code><br><button onclick="HL_enterSettings()">Wijzigen</button>&nbsp;<button onclick="exportjson()">Opslaan</button></span>';
  strleft += '</td><td style="vertical-align:top;padding:5px">'
  strleft += 'U kan het schema opslaan op uw lokale harde schijf voor later gebruik. De standaard-naam is eendraadschema.eds. U kan deze wijzigen door links op "wijzigen" te klikken. ';
  strleft += 'Klik vervolgens op "opslaan" en volg de instructies van uw browser. '
  strleft += 'In de meeste gevallen zal uw browser het bestand automatisch plaatsen in de Downloads-folder tenzij u uw browser instelde dat die eerst een locatie moet vragen.<br><br>'
  strleft += 'Eens opgeslagen kan het schema later opnieuw geladen worden door in het menu "openen" te kiezen en vervolgens het bestand op uw harde schijf te selecteren.<br><br>'
  strleft += '</td></tr>';

  strleft += PROP_GDPR(); //Function returns empty for GIT version, returns GDPR notice when used online.

  '</table>';
  //-- plaats input box voor naam van het schema bovenaan --

  strleft += '<br>';

  document.getElementById("configsection").innerHTML = strleft;
  hide2col();

  //renderPrintSVG();
}

function openContactForm() {
  var strleft: string = PROP_Contact_Text;

  document.getElementById("configsection").innerHTML = strleft;
  hide2col();
}

function restart_all() {
  var strleft: string = CONFIGPAGE_LEFT;

  strleft +=
  `
    Hoofddifferentieel (in mA) <input id="differentieel_droog" type="text" size="5" maxlength="5" value="300"><br>
    Hoofdzekering (in A) <input id="hoofdzekering" type="text" size="4" maxlength="4" value="65"><br><br>
    Aantal fazen:
    <select id="aantal_fazen_droog"><option value="2">2p</option><option value="3">3p</option><option value="4">4p (3p+n)</option></select>
    <br><br>
    Aantal kringen droog:
    <select id="aantal_droge_kringen">
  `

  for (var i=1;i<51;i++) {
    if (i==7) {
      strleft = strleft + '<option selected="selected" value="'+i+'">'+i+'</option>'
    } else {
      strleft = strleft + '<option value="'+i+'">'+i+'</option>'
    }
  }

  strleft += `
    </select>
    <br>
    Aantal kringen nat:
    <select id="aantal_natte_kringen">
  `

  for (var i=1;i<21;i++) {
    if (i==3) {
      strleft = strleft + '<option selected="selected" value="'+i+'">'+i+'</option>'
    } else {
      strleft = strleft + '<option value="'+i+'">'+i+'</option>'
    }
  }

  strleft +=  `
    </select><br><br>
    Aantal fazen nat: <select id="aantal_fazen_nat"><option value="2">2p</option><option value="3">3p</option><option value="4">4p (3p+n)</option></select><br>
    Differentieel nat (in mA) <input id="differentieel_nat" type="text" size="5" maxlength="5" value="30"><br>
  `
  //<button onclick="read_settings()">Start</button>

  var strright:string = `<br><br><br><br>
    Deze tool tekent een &eacute;&eacute;ndraadschema.
    De tool is in volle ontwikkeling en laat thans toe meer complexe
    schakelingen met gesplitste kringen en horizontale aaneenschakelingen
    van gebruikers (bvb koelkast achter een stopcontact) uit te voeren.
    <br><br>
    Eveneens kunnen de schemas worden opgeslagen en weer ingeladen
    voor latere aanpassing (zie knoppen "export" en "bladeren").
    <br><br>
    Op basis van een screenshot-tool (bvb snipping-tool in Windows) kan het gegenereerde
    &eacute;&eacute;ndraadschema verder verwerkt worden in een meer complete schets.
    Een andere mogelijkheid is het eendraadschema te exporteren (SVG-vector-graphics) en verder te verwerken
    met een professionele tool zoals Inkscape (open source optie).
    <br><br>
     Nuttige tips:
    <ul>
      <li>Kies "meerdere gebruikers" om horizontale ketens te bouwen, bijvoorbeeld een koelkast na een stopcontact.</li>
      <li>Een schakelbaar stopcontact kan gemaakt worden door onder "meerdere gebruikers" eerst een lichtcircuit met "0" lampen gevolgd door een stopcontact te voorzien.</li>
    </ul>
  `

  strleft += CONFIGPAGE_RIGHT;

  strleft += PROP_getCookieText(); //Will only be displayed in the online version

  document.getElementById("configsection").innerHTML = strleft;
  hide2col();

  if (browser_ie_detected()) {
    alert("Deze appicatie werkt niet in Internet Explorer. Wij raden aan een moderne browser te gebruiken zoals Edge, Firefox, Google Chrome, Opera, Vivaldi, ...");
  }
}

function hide2col() {
  var leftElement = document.getElementById("left_col_inner");
  var rightElement = document.getElementById("right_col_inner");
  if(typeof(leftElement) != 'undefined' && leftElement != null){
    leftElement.innerHTML = "";
  };
  if(typeof(rightElement) != 'undefined' && rightElement != null){
    rightElement.innerHTML = "";
  };
  document.getElementById("canvas_2col").innerHTML = "";
}

function show2col() {
  if (document.getElementById("canvas_2col").innerHTML == "") {
    document.getElementById("canvas_2col").innerHTML = '<div id="left_col"><div id="left_col_inner"></div></div><div id="right_col"><div id="right_col_inner"></div></div>';
  }
}

function import_to_structure(mystring: string, redraw = true) {

  var text:string = "";

  //If first 3 bytes read "EDS", it is an entropy coded file
  //The first 3 bytes are EDS, the next 3 bytes indicate the version (currently only 001 implemented)
  //the next 4 bytes are decimal zeroes "0000"
  //thereafter is a base64 encoded data-structure
  if ( (mystring.charCodeAt(0)==69) && (mystring.charCodeAt(1)==68) && (mystring.charCodeAt(2)==83) ) { //recognize as EDS
    mystring = atob(mystring.substring(10,mystring.length))
    var buffer:Uint8Array = new Uint8Array(mystring.length);
    for (var i = 0; i < mystring.length; i++) {
      buffer[i-0] = mystring.charCodeAt(i);
    }
    try { //See if the text decoder works, if not, we will do it manually (slower)
      var decoder = new TextDecoder("utf-8");
      text = decoder.decode(pako.inflate(buffer));
    } catch (error) { //Continue without the text decoder (old browsers)
      var inflated:Uint8Array = pako.inflate(buffer);
      text = "";
      for (i=0; i<inflated.length; i++) {
        text += String.fromCharCode(inflated[i])
      }
    }
  }

  //If first 3 bytes do not read "EDS", the file is in the old non encoded format and can be used as is
  else {
    text = mystring;
  }

  var mystructure: Hierarchical_List = new Hierarchical_List();
  structure = new Hierarchical_List();
  var obj = JSON.parse(text);
  (<any> Object).assign(mystructure, obj);

  if (typeof mystructure.properties.filename != "undefined") {
    structure.properties.filename = mystructure.properties.filename;
  }
  if (typeof mystructure.properties.owner != "undefined") {
    structure.properties.owner = mystructure.properties.owner;
  }
  if (typeof mystructure.properties.installer != "undefined") {
    structure.properties.installer = mystructure.properties.installer;
  }
  if (typeof mystructure.properties.info != "undefined") {
    structure.properties.info = mystructure.properties.info;
  }

  for (var i = 0; i < mystructure.length; i++) {
    if (mystructure.data[i].parent==0) {
      structure.addItem(new Electro_Item());
      structure.data[i].parent = 0;
    } else {
      structure.addItem(new Electro_Item(structure.data[structure.getOrdinalById(mystructure.data[i].parent)]));
      structure.data[i].parent = mystructure.data[i].parent;
    }

    structure.active[i] = mystructure.active[i];
    structure.id[i] = mystructure.id[i];

    for (var j = 0; j < mystructure.data[i].keys.length; j++) {
      structure.data[i].keys[j] = mystructure.data[i].keys[j];
    }
    structure.data[i].id = mystructure.data[i].id;
    structure.data[i].indent = mystructure.data[i].indent;
    structure.data[i].collapsed = mystructure.data[i].collapsed;
  }

  //As we re-read the structure and it might be shorter then it once was (due to deletions) but we might still have the old high ID's, always take over the curid from the file
  structure.curid = mystructure.curid;

  //Sort the entire new structure
  structure.reSort();

  //Draw the structure
  if (redraw == true) {
    HLRedrawTree();
  }
}

function load_example(nr: number) {
  switch (nr) {
    case 0:
      import_to_structure(EXAMPLE0);
      break;
    case 1:
      import_to_structure(EXAMPLE1);
      break;
  }
}

var importjson = function(event) {
  var input = event.target;
  var reader = new FileReader();
  var text:string = "";

  reader.onload = function(){
    var mystring = reader.result.toString();

    //If first 3 bytes read "EDS", it is an entropy coded file
    //The first 3 bytes are EDS, the next 3 bytes indicate the version (currently only 001 implemented)
    //the next 4 bytes are decimal zeroes "0000"
    //thereafter is a base64 encoded data-structure
    if ( (mystring.charCodeAt(0)==69) && (mystring.charCodeAt(1)==68) && (mystring.charCodeAt(2)==83) ) { //recognize as EDS
      mystring = atob(mystring.substring(10,mystring.length))
      var buffer:Uint8Array = new Uint8Array(mystring.length);
      for (var i = 0; i < mystring.length; i++) {
        buffer[i-0] = mystring.charCodeAt(i);
      }
      try { //See if the text decoder works, if not, we will do it manually (slower)
        var decoder = new TextDecoder("utf-8");
        text = decoder.decode(pako.inflate(buffer));
      } catch (error) { //Continue without the text decoder (old browsers)
        var inflated:Uint8Array = pako.inflate(buffer);
        text = "";
        for (i=0; i<inflated.length; i++) {
          text += String.fromCharCode(inflated[i])
        }
      }
    }

    //If first 3 bytes do not read "EDS", the file is in the old non encoded format and can be used as is
    else {
      text = mystring;
    }

    //code to transform input read into memory structure
    import_to_structure(text);
  };

  reader.readAsText(input.files[0]);
};


function importclicked() {
  document.getElementById('importfile').click();
  (document.getElementById('importfile') as HTMLInputElement).value = "";
}

function download_by_blob(text, filename, mimeType) {
  var element = document.createElement('a');
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(new Blob([text], {
      type: mimeType
    }), filename);
  } else if (URL && 'download' in element) {
    let uriContent = URL.createObjectURL(new Blob([text], {type : mimeType}));
    element.setAttribute('href', uriContent);
    //element.setAttribute('href', mimeType + ',' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  } else {
    this.location.go(`${mimeType},${encodeURIComponent(text)}`);
  }
}

function download(type: string) {
  var filename:string;
  var mimeType:string;
  switch (type) {
    case "html": {
      filename = "eendraadschema.html";
      mimeType = 'data:image/svg+xml;charset=utf-8';
      break;
    }
    case "svg": {
      filename = "eendraadschema.svg";
      mimeType = 'data:text/html;charset=utf-8';
      break;
    }
  }
  var text:string = structure.toSVG(0,"horizontal").data;
  //Experimental, flatten everything
  if ((document.getElementById("noGroup") as HTMLInputElement).checked == true) {
    text = flattenSVGfromString(text);
  }

  download_by_blob(text, filename, mimeType); //was text/plain
}

function read_settings() {
  CONF_aantal_droge_kringen = parseInt((document.getElementById("aantal_droge_kringen") as HTMLInputElement).value);
  CONF_aantal_natte_kringen = parseInt((document.getElementById("aantal_natte_kringen") as HTMLInputElement).value);
  CONF_aantal_fazen_droog = parseInt((document.getElementById("aantal_fazen_droog") as HTMLInputElement).value);
  CONF_aantal_fazen_nat = parseInt((document.getElementById("aantal_fazen_nat") as HTMLInputElement).value);
  CONF_hoofdzekering = parseInt((document.getElementById("hoofdzekering") as HTMLInputElement).value);
  CONF_differentieel_droog = parseInt((document.getElementById("differentieel_droog") as HTMLInputElement).value);
  CONF_differentieel_nat = parseInt((document.getElementById("differentieel_nat") as HTMLInputElement).value);
  reset_all();
}

//--- MAIN PROGRAM ---

declare var CONF_builddate: any; //needed to be able to read the variable from the builddate.js file (otherwise compiler will complain)

var CONF_aantal_droge_kringen = 7;
var CONF_aantal_natte_kringen = 3;
var CONF_aantal_fazen_droog = 2;
var CONF_aantal_fazen_nat = 2;
var CONF_hoofdzekering = 65;
var CONF_differentieel_droog = 300;
var CONF_differentieel_nat = 30;
var CONF_upload_OK = "ask"; //can be "ask", "yes", "no"; //before uploading, we ask

var structure: Hierarchical_List;
import_to_structure(EXAMPLE_DEFAULT,false); //Just in case the user doesn't select a scheme and goes to drawing immediately, there should be something there

restart_all();
