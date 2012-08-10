/*
 * spUtils - v 1.0
 * http://sputils.codeplex.com
 *
 * Open source under the MIT license
 *
 * Copyright (c) 2011-2012, Matthew Bramer
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above
 *     copyright notice, this list of conditions and the following
 *     disclaimer in the documentation and/or other materials provided
 *     with the distribution.
 *   - Neither the name of the author nor the names of its contributors
 *     may be used to endorse or promote products derived from this
 *     software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
*/

(function( window ) {
	// Use the correct document accordingly with window argument (sandbox)
	//var document = window.document,
	//	navigator = window.navigator,
	var location = window.location,
		_privy = "_spUtilsUnderscoredForAReason",
		_internalProps = {}
	; //local vars

	_internalProps[ _privy ] = {
		//Used for internal properties of spUtils
		"_spBodyOnLoadFunctionNamesQueued" : false,
		"onLoadFunctions" : []
	};

	//console.dir( _spBodyOnLoadFunctionNames );

/*


function AjaxRequest( options ) {
	$.ajax({
		async: options.isAsync,
		url: options.queryURL,
		//dataType: "xml",  <--- stripped due to publishing page xml parseerror. See link below
		contentType: "text/xml;charset='utf-8'",
		complete: function ( xData, Status ) {
			var webPartMarkup = $( xData.responseText ).find( options.elementID ).html();
			$( options.elementID ).html( webPartMarkup ).css({ opacity: 0.0 }).animate({ opacity: 1.0 }, options.effectDelay );
		}
	});
}

function AjaxifyWebpart( options ) {
	if ( options.elementID ) {
		$( options.elementID ).html( options.waitMessage );
		AjaxRequest( options );
	} else {
		$( "#MSO_ContentTable, #ctl00_MSO_ContentDiv" ).find( "td[id^='WebPartTitleWPQ'] span" ).each(function() {
			if ( $( this ).text() == options.webPartTitle ) {
				var $webPart = $( this ).closest( "table" ).closest( "tr" ).next().find( "div[id^='WebPartWPQ']:first" );
				options.elementID = "#" + $webPart.attr( "id" );
				$webPart.html( options.waitMessage );
				AjaxRequest( options );
				return false;
			}
		});
	}
}


AjaxifyWebpart({
	//ID of Web Part. Useful for Web Parts that have the name hidden.
	//Remember to prefix your ID with: #
	//elementID: "#WebPartWPQ2",
	//Title of webpart. Yes, it is case sensitive!
	webPartTitle: 'Quick Launch Accordion Overview',
	//The twirly whirly feedback prop
	waitMessage: "<table width='100%' align='center'><tr><td align='center'><img src='/_layouts/images/gears_an.gif' alt='Processing... Please wait...'/></td></tr></table>",
	//The address you are pulling the webpart from.  window.location.href is the current URL
	queryURL: window.location.href.split("?")[0],
	//isAsync accepts: true or false  //For more info on asynchronous AJAX calls: http://api.jquery.com/jQuery.ajax/
	isAsync: true,
	//Number of milliseconds to delay the animation of the webpart
	effectDelay: 1500
});


////
//	Dynamically load jQuery
////
        var re = document.createElement('script'); re.type = 'text/javascript'; re.async = true;
        re.src = url_;
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(re, s);


var jQueryScript = document.createElement("script");
                    jQueryScript.type = "text/javascript";
                    jQueryScript.src = “/_layouts/MyJSPath/myjsfile.js;
                    document.getElementsByTagName("head")[0].appendChild(jQueryScript);



	Figure this out later

	if ( typeof $ === 'undefined' ) {
		//Borrowed from HTML5 Boilerplate
		var g=document.createElement( 'script' ),
			s=document.getElementsByTagName( 'script' )[ 0 ]
		;//local vars

		g.src='//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
		s.parentNode.insertBefore( g, s );
	}
*/
	//Sanbox SharePoint variables
	var executeScript = ExecuteOrDelayUntilScriptLoaded,
		//Booleans for environment checking
		isJquery = ( $ || window.jQuery ) ? true : false,
		//isSPServices = ( $ && $.fn.SPServices ) ? true : false,
		//ternary op ~ boolean result.

		isSP = ( typeof executeScript === 'function' ) ? true : false,
		//isRoboCAML = ( window.roboCAML ) ? true : false,


		/***********************************************************
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			~~~~~~~~~~Private methods~~~~~~~~~~~~~~
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		***********************************************************/
		/***********************************************************
			Initialize method ~ loops through onLoadFunctions array and fires cached spUtils call after sp.js has been loaded.
		***********************************************************/
		init = function( onLoadFunctions ) {
			//debugger;
			for( var i = 0; i<onLoadFunctions.length; i=i+2 ) {
				//var expr="if ( typeof (" + onLoadFunctions[ i ] + ") == 'function') {(" + onLoadFunctions[ i ] + "(" + eval( onLoadFunctions[ i + 1 ] ) + "));}";
				//log( expr );
				//eval( expr );
				onLoadFunctions[ i ]( onLoadFunctions[ i + 1 ] );
			}
		},
		/***********************************************************
			Used to cache spUtil calls until sp.js has been loaded
		***********************************************************/
		cacheSpUtilsCall = function( cachedFunc, options ) {
			if ( typeof SP === "undefined" || typeof SP.ClientContext !== "function" || typeof SP.CamlQuery !== "function" ) {
				_internalProps[ _privy ].onLoadFunctions.push( cachedFunc, options );
				return true;
			}
		},
		getListItemsSucceeded = function( data, ctx ) {

			//debugger;
			var enumerator = ctx.getEnumerator(),
				listData = ctx.get_data()

			; //local vars

			//debugger;

			while ( enumerator.moveNext() ) {
				var listItem = enumerator.get_current();

				// Here's your chance to do something awesome...
				log( listItem.get_item("Title") );
			}
		},
		noop = function() {
			//Nothing to see here!
		},
		spCsomError = function( sender, error ) {
			//debugger;

			var msg = 'Request failed. ' + error.get_message();

			if ( error.get_stackTrace() ) {
				msg += '\n' + error.get_stackTrace();
			}

			log( msg );
		},
		//Determines what type of parameter is being passed
		//http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
		toType = function( obj ) {
			return ( {} ).toString.call( obj ).match(/\s([a-zA-Z]+)/)[ 1 ].toLowerCase();
		},


		/***********************************************************
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			~~~~~~~~~~~Public methods~~~~~~~~~~~~~
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		***********************************************************/
		addStatus = function( message, color ) {
			var statusId = SP.UI.Status.addStatus( message );

			if ( color ) {
				SP.UI.Status.setStatusPriColor( statusId, color );
			}

			return statusId;
		},
		closeDialog = function( result ) {
			// SP.UI.DialogResult.OK
			// SP.UI.DialogResult.Cancel
			SP.UI.ModalDialog.commonModalDialogClose( result );
		},
		createCallback = function( ctx, a ) {
			return function () {
				var argLength = arguments.length;
				if ( argLength > 0 ) {
					var d = [];
					for ( var i = 0; i < argLength; i++ ) {
						d[ i ] = arguments[ i ];
						d[ argLength ] = a;
						return ctx.apply( this, d );
					}
				}
				return ctx.call( this, a );
			};
		},
		createDelegate = function( a, b ) {
			return function() {
				return b.apply( a, arguments );
			};
		},
		createListItems = function( options ) {
			var opt = options || {};

			if ( cacheSpUtilsCall( createListItems, opt ) ) {
				return;
			}

			// Get the current context
			var context = getWebURL( opt ),
                targetList = findList( context, opt.listName ),
				successCallback = opt.success || noop,
				errorCallback = opt.error || spCsomError,
				//Used to search Static Names that are labeled as lookups.
				rLookupCheck = /\{L\}/i

			; //local vars


			// debugger;


			for ( var i = 0; i < opt.updates.length; i++ ) {
				// create the ListItemInformation object
				var listItemInfo = new SP.ListItemCreationInformation(),
					listItem,
					itemVals = opt.updates[ i ]
				; //local vars
				
				// SP.ListItemCreationInformation.set_folderUrl()
				// http://msdn.microsoft.com/en-us/library/ee548300
				if ( itemVals.hasOwnProperty("folderUrl") ) {
					listItemInfo.set_folderUrl( itemVals.folderUrl );
					delete itemVals.folderUrl;
				}
				
				// SP.ListItemCreationInformation.set_folderUrl()
				// http://msdn.microsoft.com/en-us/library/ee548300
				// http://spservices.codeplex.com/discussions/79668 <--- a golden oldie
				if ( itemVals.hasOwnProperty("folderName") ) {
					listItemInfo.set_leafName( itemVals.folderName );
					itemVals.FSObjType = 1;
					itemVals.BaseName = itemVals.folderName;
					delete itemVals.folderName;
				}
				
				// add the item to the list
				listItem = targetList.addItem( listItemInfo );

				for ( var staticName in itemVals ) {
					if ( itemVals.hasOwnProperty( staticName ) ) {
						if ( rLookupCheck.test( staticName ) ) {
							//Lookup field needs to be catered using FieldLookUp value
							//Also multiItemLookup fields need to have an array of new SP.FieldLookupValue().
							//So we'll just make all lookups use lookupValueContainer
							var lookupValueContainer = [],
								// Coerce into string and then split. Prevents error when one lookup id is passed as a number primitive.
								values = itemVals[ staticName ] + "",
								values = values.split(";#"),
								c = 0
							;

							for ( ; c < values.length; c++ ) {
								var lookupValue = new SP.FieldLookupValue();
								lookupValue.set_lookupId( values[ c ] );
								
								lookupValueContainer.push( lookupValue );
							}

							listItem.set_item(
								//Trim off {*} delimiter
								staticName.split("{")[ 0 ],
								lookupValueContainer
							);

							listItem.update();
						} else {
							listItem.set_item( staticName, itemVals[ staticName ] );
							listItem.update();
						}
					}
				}
			}

			//Make a query call to execute the above statements
			context.executeQueryAsync(
				Function.createDelegate( this, successCallback ),
				Function.createDelegate( this, errorCallback )
			);
		},
		deleteListItems = function( options ) {
			var opt = options || {};

			if ( cacheSpUtilsCall( deleteListItems, opt ) ) {
				return;
			}

			//Get the current client context and list
			var context = getWebURL( opt ),
				targetList = findList( context, opt.listName ),
				typeOfDeletion = toType( opt.id ),
				i=0,
				listItem,
				successCallback = opt.success || noop,
				errorCallback = opt.error || spCsomError
			; //local vars

			if ( typeOfDeletion === "number" ) {
				listItem = targetList.getItemById( opt.id );
				listItem.recycle();
			} else {
				for ( ; i<opt.id.length; i++ ) {
					listItem = targetList.getItemById( opt.id[ i ] );
					listItem.recycle();
				}
			}

			context.executeQueryAsync(
				Function.createDelegate( this, successCallback ),
				Function.createDelegate( this, errorCallback )
			);
		},
		findList = function( ctx, listName ) {
			return ctx.get_web().get_lists().getByTitle( listName );
		},
/*
	Implement after full testing.
		getFormControl = function( columnName ) {
			$(".ms-standardheader > nobr").filter(function() {
				return $(this).text() === columnName;
			});
		},
*/
		//getValue seems nicer
		getFormVal = function( columnName ) {
			var ddlVal = $("select[title='" + columnName + "']").val();

			if ( ddlVal === undefined ) {
				ddlVal = $("input[title='" + columnName + "']").val();
			}

			return ddlVal;
		},





		//GetList Op??? Where you @?
/*
  var clientContext = new SP.ClientContext.get_current();
    var web = clientContext.get_web();
    var lists = web.get_lists();
    clientContext.load(lists);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onListsQuerySucceeded), Function.createDelegate(this, this.onListsQueryFailed));
*/




		getListItems = function( opt ) {
			/* Valid options
			* webURL, listName, CAMLQuery, Folder, Include, success, error, debug
			*/
			var options = opt || {};
			//log("in GetListItems: " + options.listName );
			//console.dir( SP );
			//debugger;

			if ( cacheSpUtilsCall( getListItems, options ) ) {
				return;
			}

			var context,
				targetList,
				camlQuery,
				includeFields = "Include(",
				loopLength,
				successCallback,
				errorCallback
			; //local vars

			try {
				//Get the current client context
				context = getWebURL( options );

				//debugger;
				targetList = findList( context, options.listName );

				//CAML Query
				if ( options.hasOwnProperty("CAMLQuery") ) {
					camlQuery = new SP.CamlQuery();
					camlQuery.set_viewXml( options.CAMLQuery );
				} else {
					camlQuery = SP.CamlQuery.createAllItemsQuery();
				}

				//Folder options
				if ( options.hasOwnProperty("Folder") ) {
					camlQuery.set_folderServerRelativeUrl( options.Folder );
				}

				//log( SP.CamlQuery.get_viewXml() );
				//debugger;

				//Create stub for the biznass end of getListItems
				options.listItems = {};
				options.listItems = targetList.getItems( camlQuery );


				//Fields retrieved using Include technique
				if ( options.hasOwnProperty("Include") ) {
					loopLength = options.Include.length;

					while ( loopLength-- ) {
						//log( opt.Include[ loopLength ] );
						includeFields += options.Include[ loopLength ];

						if ( loopLength !== 0 ) {
							includeFields += ",";
						}
						//log( loopLength );
					}

					includeFields += ")"; //Close Include
					context.load( options.listItems, includeFields );
				} else {
					context.load( options.listItems );
				}

				//console.dir( options );
				//debugger;
				errorCallback = options.error || spCsomError;
				// Set up success callback. Wraps the success property with a function and injects two parameters into the callback.
				// Also iterate listItemData to return an array of objects to callback function.
				successCallback = options.success || getListItemsSucceeded;			
				options.success = function() {
					var listItems = options.listItems,
						listItemsData = listItems.get_data(),
						data = []

					; //local vars


					for ( var prop in listItemsData ) {
						if ( listItemsData.hasOwnProperty( prop ) ) {
							//console.dir( listItemsData[ prop ].get_fieldValues() );
							data.push( listItemsData[ prop ].get_fieldValues() );
						}
					}

					//debugger;
					successCallback( data, listItems );
				};

				context.executeQueryAsync(
					Function.createDelegate( this, options.success ),
					Function.createDelegate( this, errorCallback )
				);
			}
			catch ( e ) {
				if ( options.debug ) {
					log( e );
				}
			}
		},
		getProp = function( prop ) {
			var arrOfProps = prop.split("."),
				arrOfPropsLength = arrOfProps.length,
				i,
				returnVal = _internalProps[ prop ]

			;//local vars

			// Loop through dot notation of string passed in. End result = last property of string
			if ( arrOfPropsLength ) {
				for ( i=1; i<=arrOfPropsLength; i++ ) {
					returnVal = _internalProps[ arrOfProps[ arrOfPropsLength -1 ] ];
				}
			}

			return returnVal;
		},
		// http://stackoverflow.com/questions/647259/javascript-query-string
		getQueryString = function() {
			var result = {}, queryString = location.search.substring(1),
				re = /([^&=]+)=([^&]*)/g,
				m;

			while ( m = re.exec( queryString ) ) {
				result[ decodeURIComponent( m[ 1 ] ) ] = decodeURIComponent( m[ 2 ] );
			}
			return result;
		},
		getWebURL = function( options ) {

			if ( options.hasOwnProperty("webURL") ) {
				return SP.ClientContext( options.webURL );
			}

			return SP.ClientContext.get_current();
		},




/*

		getUniqueItems = function( opt ) {

			Need to resolve:
				weburl
				listId [guid]
				staticName
				viewId [guid] ~ Use default list view unless passed as param



			$.ajax({
				url: weburl+'/_layouts/filter.aspx?ListId='+escape(listId)+'&FieldInternalName='+internalName+'&ViewId='+escape(viewId)+'&FilterOnly=1&Filter=1',
				success: function( status, data ) {
					//Do Something  } });
			//do something awesome

		},



*/

		isoDate = function( d ) {
			//defaults to new date
			d = d || new Date();

			function pad( n ) {
				return n < 10 ? '0' + n : n;
			}

			return d.getUTCFullYear() + '-' +
				pad( d.getUTCMonth() +1 ) + '-' +
				pad( d.getUTCDate() ) + 'T' +
				pad( d.getUTCHours() ) +':' +
				pad( d.getUTCMinutes() )+':' +
				pad( d.getUTCSeconds() )+'Z'
			;
		},
		log = function( message ) {
			window.console.log( message );
		},
		notify = function( feedback, persistent ) {
			return SP.UI.Notify.addNotification( feedback, persistent );
		},
		onDialogClose = function( dialogResult, returnValue, message ) {
			var feedback = ( dialogResult ) ?
				message || "This item has been saved..." :
				message || "Operation was cancelled..."
			;
			//alert("dialog result: " + dialogResult );
			spUtils.closeDialog( dialogResult );
			spUtils.notify( feedback, false );
		},
		openModalForm = function( options ) {
			/**************************************************************************************************************
			// Why so many options M$? /smh
			// http://msdn.microsoft.com/en-us/library/ff410259
			//
			// Valid options listed here: //http://blogs.msdn.com/b/sharepointdev/archive/2011/01/13/using-the-dialog-platform.aspx
			*************************
			// These options are the bare minimum needed to open a modal dialog.
			// staticListName
			// ID
			*************************
			// formType ~ Default: DispForm
			// title
			// url
			// html
			// x ~ Default to center of axis
			// y ~ Default to center of axis
			// width: 800 ~ Default
			// height: 600 ~ Default.
			// allowMaximize: true ~ Default.
			// showMaximized: false ~ Default.
			// showClose: true ~ Default.
			// autoSize: false ~ Default.
			// callback: onDialogClose ~ Default.

			********************************************************************
			Use args to pass data to the modal.  Access using: window.frameElement.dialogArgs
			*********************************************************************
			// args: {} ~ Default.
			***************************************************************************************************************/

			// Safeguard the options param
			options = options || {};
			//url will find current site for each scenario
			var url,
				formType
			; //local vars
			//L_Menu_BaseUrl --- //http://community.zevenseas.com/Blogs/Vardhaman/Lists/Posts/Post.aspx?ID=9

			if ( options.hasOwnProperty("url") ) {
				//Locates full path URL's or relative URL's
				if ( options.url.substring( 0,1 ) === "." || options.url.substring( 0,4 ) === "http" ) {
					url = options.url;
				} else {
					url = L_Menu_BaseUrl + options.url;
				}
				//deletes property to prevent overwriting when extending options
				delete options.url;
			} else {
				switch ( formType.toLowerCase() ) {
					case "display":
						formType = "DispForm";
						break;
					case "edit":
						formType = "EditForm";
						break;
					case "new":
						formType = "NewForm";
						break;
					default:
						formType = "DispForm";
						break;
				}

				//Default the base URL to the url variable
				if ( L_Menu_BaseUrl === "" ) {
					url = "/Lists/" + options.staticListName + "/" + formType + ".aspx?ID=" + options.ID;
				} else {
					url = L_Menu_BaseUrl + "/Lists/" + options.staticListName + "/" + formType + ".aspx?ID=" + options.ID;
				}
			}

			//Rid jQuery dependency on this method...
			var opt = {
				title: options.title || "",
				url: url,
				html: options.html || undefined,
				height: options.height || 600,
				width: options.width || 800,
				allowMaximize: options.allowMaximize || true,
				showMaximized: options.showMaximized || false,
				showClose: options.showClose || true,
				autoSize: options.autoSize || false,
				dialogReturnValueCallback: options.callback || onDialogClose,
				//Use args to pass data to the modal.  Access using: window.frameElement.dialogArgs
				args: options.args || {}
			};

			//debugger;
			//Create modal
			SP.UI.ModalDialog.showModalDialog( opt );
		},
		removeNotify = function( id ) {
			SP.UI.Notify.removeNotification( id );
		},
		removeStatus = function( statusId, ms ) {
			ms = ms || 100;
			
			window.setTimeout(
				function() {
					SP.UI.Status.removeStatus( statusId );
				},
				ms
			);	
		},
/*
		startWorkflow = function( options ) {
			var opt = options || {};

			//console.dir( targetList.get_workflowAssociations().getByName("Workflow1") );


			if ( cacheSpUtilsCall( startWorkflow, options ) ) {
				return;
			}

			var context,
				targetList,
				camlQuery,
				includeFields = "Include(",
				loopLength,
				successCallback,
				errorCallback
			; //local vars

			try {
				//Get the current client context
				context = getWebURL( options );

				//debugger;
				targetList = findList( context, options.listName );
			}
			catch( e ) {

			}
		},
*/
		//setValue seems nicer
		setFormVal = function( fieldTitle, lookupVal ) {
			// A modified version of:
			// http://geekswithblogs.net/SoYouKnow/archive/2011/04/06/setting-sharepoint-drop-down-lists-w-jquery---20-items.aspx
			// No more global variables and needless DOM walking.

			//Set default value for lookups with less that 20 items
			var $selectCtrl = ("select[title='" + fieldTitle + "']"),
				$inputCtrl = $("input[title='" + fieldTitle + "']"),
				choices,
				choiceArray,
				hiddenInput,
				index
			;

			if ( $selectCtrl.html() !== null ) {
				$selectCtrl.val( lookupVal );
			} else {
				choices = $inputCtrl.attr("choices");
				hiddenInput = $inputCtrl.attr("optHid");
				$("input[id='" + hiddenInput + "']").attr( "value", lookupVal );

				choiceArray = choices.split("|");
				for ( index = 1; index < choiceArray.length; index = index + 2 ) {
					if ( choiceArray[ index ] == lookupVal ) {
						$inputCtrl.val( choiceArray[ index - 1 ] );
					}
				}
			}
		},
		setProp = function( prop, v ) {
			/***********************************
				implementation needs help..
				Want to be able to pass in a string that represent the properties; e.g:
				prop1.List.anotherPropsVal
				and then cache and return the value in the correct position


				maybe? https://gist.github.com/3078593

				http://www.reddit.com/r/javascript/comments/wadv0/recursive_object_and_array_cloning_in_127_bytes/
				https://github.com/jimmycuadra/structure/blob/master/structure.js

			*************************************/
/*
			function (namespaces, value, callback) {
				var i, l, baseObj;

				baseObj = root;
				//_internalProps
				namespaces = namespaces.split(/\./);
				l = namespaces.length;

				for (i = 0; i < l; i++) {
					if (!baseObj[namespaces[i]]) {
						if (i === l - 1 && module) {
							baseObj[namespaces[i]] = module;
						} else {
							baseObj[namespaces[i]] = {};
						}
					}
					baseObj = baseObj[namespaces[i]];
				}

				bindAll(module);

				if (callback) {
				callback(module);
				}
			},


			var arrOfProps = prop.split(/\./),
				arrOfPropsLength = arrOfProps.length,
				//firstProp = arrOfProps[ 0 ],
				//lastProp = arrOfProps[ arrOfPropsLength - 1 ],
				//i = 1,
				returnVal

			; //local vars

			for ( i=0; i < arrOfPropsLength; i++ ) {
				if ( !_internalProps[ arrOfProps[ i ] ] ) {
					if (i === l - 1 && module) {
						_internalProps[ arrOfProps[ i ] ] = value;
					} else {
						_internalProps[ arrOfProps[ i ] ] = {};
					}
				}
				baseObj = baseObj[ arrOfProps[ i ] ];
			}
*/
/*
				if ( !_internalProps.hasOwnProperty( arrOfProps[ arrOfPropsLength - 1 ] ) ) {
					_internalProps[ arrOfProps[ arrOfPropsLength - 1 ] ] = {};
				}
*/

			// checks param for final property in array
/*
			if ( arrOfPropsLength === 1 ) {
				//arguments.callee needs to be in here somewhere...
				return this[ prop ] = v;
			}
*/
/*
			if ( !lastProp ) {
				return this[ firstProp ] = v;
			}
*/
	//		this.call( _internalProps[ arrOfProps[ 0 ] ], arrOfProps, v );

/*
			for ( ; i<=arrOfPropsLength; i++ ) {
				//If prop doesn't exist
				if ( !_internalProps.hasOwnProperty( arrOfProps[ i - 1 ] ) ) {
					_internalProps[ arrOfProps[ i - 1 ] ] = {};
				}



				if ( i === arrOfPropsLength ) {
					_internalProps[ arrOfProps[ i - 1 ] ] = v;
				}
*/

		},
		updateListItems = function( opt ) {
			var options = opt || {};

			if ( cacheSpUtilsCall( updateListItems, options ) ) {
				return;
			}

			//Syntax sugar
			try {
				switch ( options.op.toLowerCase() ) {
					case "delete" :
						spUtils.deleteListItems( options );
						break;

					case "create" :
					case "new" :
						spUtils.createListItems( options );
						break;
				}
			} catch(e) {

			} finally {
				if ( options.op ) {
					return;
				}
			}

			var context = getWebURL( options ),
				targetList = findList( context, options.listName ),
				itemToUpdate
			; //local vars

			//Single item update
			if ( options.hasOwnProperty("id") ) {
				var i = 0,
					item = options.valuePairs[ 0 ]

				; //local vars

				itemToUpdate = targetList.getItemById( options.id );

				//debugger;
				for ( ; i<item.length; i=i+2 ) {
					//log( item[ i ], item[ i + 1] );
					itemToUpdate.set_item( item[ i ], item[ i + 1 ] );
				}
			} else {
				//Multi-update yabbage
				for ( var prop in options.updates ) {
					if ( options.updates.hasOwnProperty( prop ) ) {
						var item = options.updates[ prop ],
							i = 0
						; //local vars

						itemToUpdate = targetList.getItemById( prop );

						//debugger;
						for ( ; i<item.valuePairs.length; i++ ) {
							//log( item.valuePairs[ i ][ 0 ], item.valuePairs[ i ][ 1 ] );
							itemToUpdate.set_item( item.valuePairs[ i ][ 0 ], item.valuePairs[ i ][ 1 ] );
						}
					}
				}
			}

			itemToUpdate.update();

			var successCallback = options.success || noop;

			//To access list items, similar to callback
			context.executeQueryAsync(
				Function.createDelegate( this, successCallback ),
				Function.createDelegate( this, noop )
			);
		},
		//Global Object
		spUtils = {
			//Expose defautl methods
			createCallback : createCallback,
			createDelegate : createDelegate,
			getProp : getProp,
			getQueryString : getQueryString,
			isoDate : isoDate,
			log : log,
			setProp : setProp
		}
	; //variable declarations

	
	//map over console if undefined.
	if ( !window.console ) {
		window.console = {
			dir : noop,
			error : noop,
			info : noop,
			log : function( message ) {
				alert( message );
			}
		};
	}

	//Expose methods based on environment booleans
	if ( isSP ) {
		spUtils.addStatus = addStatus;
		spUtils.closeDialog = closeDialog;
		spUtils.createListItems = createListItems;
		spUtils.deleteListItems = deleteListItems;
		spUtils.getListItems = getListItems;
		spUtils.notify = notify;
		spUtils.onDialogClose = onDialogClose;
		spUtils.openModalForm = openModalForm;
		spUtils.removeNotify = removeNotify;
		spUtils.updateListItems = updateListItems;

		//Initialize SP function. Removes the need to wrap spUtils with ExecuteOrDelayUntilScriptLoaded
		executeScript( function() {
			//log( "execute SP" );
			init( _internalProps[ _privy ].onLoadFunctions );
		}, 'sp.js');
	}
	if ( isJquery ) {
		spUtils.getFormVal = getFormVal;
		spUtils.setFormVal = setFormVal;
	}

	//Expose spUtils as a global object
	window.spUtils = spUtils;
	//console.dir( "spBodyOnLoadFunctionNames: " + _spBodyOnLoadFunctionNames );
})( window );