/*
 * spUtils - v 0.1 ALPHA
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

(function( window, undefined ) {
	// Use the correct document accordingly with window argument (sandbox)
	var document = window.document,
		navigator = window.navigator,
		location = window.location,
		_privy = "_spUtilsUnderscoredForAReason",
		_internalProps = {}
	; //local vars

	_internalProps[ _privy ] = {
		//Used for internal properties of spUtils

	};

	//map over console if undefined.
	if ( !window.console ) {
		console = {
			dir : function() {},
			error : function() {},
			info : function() {},
			log : function() {
				alert( message );
			}
		};
	}

/*





var jQueryScript = document.createElement("script");
                    jQueryScript.type = "text/javascript";
                    jQueryScript.src = �/_layouts/MyJSPath/myjsfile.js;
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
		isSPServices = ( $ && $.fn.SPServices ) ? true : false,
		//ternary op ~ boolean result.
		isSP = ( typeof executeScript !== 'undefined' ) ?
			( function() {
				if ( typeof window.SP === 'undefined' ) {
					//console.log( "execute SP" );
					executeScript( function() {
					}, 'sp.js');
				}
				//Set isSP to true.
				return true;
			}() ) :
			//Set isSP to false.
			false,
		isRoboCAML = ( window.roboCAML ) ? true : false,


		/***********************************************************
		************************************************************
			//Helper methods
		************************************************************
		***********************************************************/
		getListItemsSucceeded = function( sender, args ) {

			//debugger;

			var output = '',
				location = window.location,
				fileType,
				fileRef,
				arrTempVal,
				picName,
				enumerator = this.listItems.getEnumerator(),
				listData = this.listItems.get_data()

			; //local vars


			for ( var prop in listData ) {
				if ( listData.hasOwnProperty( prop ) ) {
					console.dir( listData[ prop ].get_fieldValues() );
				}
			}

			while ( enumerator.moveNext() ) {
				var listItem = enumerator.get_current();

				// Here's your chance to do something awesome...
				// console.log( listItem.get_item("Title") );
			}
		},
		getListItemsFailed = function( sender, args ) {
			var msg = 'Request failed. ' + args.get_message() + '\n';

			if ( args.get_stackTrace() ) {
				msg += args.get_stackTrace();
			}

			log( msg );
		},
		//Determines what type of parameter is being passed
		//http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
		toType = function( obj ) {
			return ( {} ).toString.call( obj ).match(/\s([a-zA-Z]+)/)[ 1 ].toLowerCase();
		},
		
		/***********************************************************
		************************************************************
			//Create methods
		************************************************************
		***********************************************************/
		addStatus = function( message, color ) {
			var statusId = SP.UI.Status.addStatus( message );

			if ( color ) {
				SP.UI.Status.setStatusPriColor( statusId, color );
			}

			return statusId;


/*
			window.setTimeout(
				function() {
					SP.UI.Status.removeStatus( statusId );
				},
				7500
			);
*/
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
						d[ argLength ]=a;
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
		getFormVal = function( columnName ) {
			var ddlVal = $("select[title='" + columnName + "']").val();

			if ( ddlVal === undefined ) {
				ddlVal = $("input[title='" + columnName + "']").val();
			}

			return ddlVal;
		},





		//GetList Op??? Where you @?








		getListItems = function( opt ) {
			/* Valid options
			* webURL, listName, CAMLQuery, Folder, Include, success, error, debug
			*/
			//Add opt to a property of this function. This is useful when the delegate is called.
			this.options = opt || {};

			var context,
				targetList,
				camlQuery,
				includeFields = "Include(",
				loopLength
			; //local vars

			try {
				//Get the current client context
				if ( opt.hasOwnProperty("webURL") ) {
					context = SP.ClientContext( opt.webURL );
				} else {
					context = SP.ClientContext.get_current();
				}

				//debugger;
				targetList = context.get_web().get_lists().getByTitle( opt.listName );

				//CAML Query
				if ( opt.hasOwnProperty("CAMLQuery") ) {
					camlQuery = new SP.CamlQuery();
					camlQuery.set_viewXml( opt.CAMLQuery );
				} else {
					camlQuery = SP.CamlQuery.createAllItemsQuery();
				}

				//Folder options
				if ( opt.hasOwnProperty("Folder") ) {
					camlQuery.set_folderServerRelativeUrl( opt.Folder );
				}

				//log( SP.CamlQuery.get_viewXml() );
				//debugger;

				this.listItems = targetList.getItems( camlQuery );


				//Fields retrieved using Include technique
				if ( opt.hasOwnProperty("Include") ) {
					loopLength = opt.Include.length;

					while ( loopLength-- ) {
						//log( opt.Include[ loopLength ] );
						includeFields += opt.Include[ loopLength ];

						if ( loopLength !== 0 ) {
							includeFields += ",";
						}
						//log( loopLength );
					}

					includeFields += ")"; //Close Include
					context.load( this.listItems, includeFields );
				} else {
					context.load( this.listItems );
				}


				//debugger;

				context.executeQueryAsync(
					Function.createDelegate( this, opt.success || getListItemsSucceeded ),
					Function.createDelegate( this, opt.error || getListItemsFailed )
				);
			}
			catch ( e ) {
				if ( opt.debug ) {
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
				result[ decodeURIComponent( m[1] ) ] = decodeURIComponent( m[2] );
			}
			return result;
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
			//console.log( spUtils.ISODateString( new Date() ) );

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
			console.log( message );
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
			// formType ~ Default: NewForm
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

/*
			var opt = $.extend({}, {
				title: title || "",
				url: url,
				//x: 0,
				//y: 0,
				width: 800,
				height: 600,
				allowMaximize: true,
				showMaximized: false,
				showClose: true,
				autoSize: false,
				dialogReturnValueCallback: onDialogClose,
				//Use args to pass data to the modal.  Access using: window.frameElement.dialogArgs
				args: {}
			}, options);
*/

			//debugger;
			//Create modal
			SP.UI.ModalDialog.showModalDialog( opt );
		},
		removeNotify = function( id ) {
			SP.UI.Notify.removeNotification( id );
		},
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
			*************************************/
			var arrOfProps = prop.split("."),
				arrOfPropsLength = arrOfProps.length,
				firstProp = arrOfProps[ 0 ],
				lastProp = arrOfProps[ arrOfPropsLength - 1 ],
				//i = 1,
				returnVal

			; //local vars

			if ( !_internalProps.hasOwnProperty( arrOfProps[ arrOfPropsLength - 1 ] ) ) {
				_internalProps[ arrOfProps[ arrOfPropsLength - 1 ] ] = {};
			}
			// checks param for final property in array
			if ( arrOfPropsLength === 1 ) {
				//arguments.callee needs to be in here somewhere...
				return this[ prop ] = v;
			}
/*
			if ( !lastProp ) {
				return this[ firstProp ] = v;
			}
*/
			this.call( _internalProps[ arrOfProps[ 0 ] ], arrOfProps, v );

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




	//Expose methods based on environment booleans
	if ( isSP ) {
		spUtils.notify = notify;
		spUtils.closeDialog = closeDialog;
		spUtils.getListItems = getListItems;
		spUtils.onDialogClose = onDialogClose;
		spUtils.openModalForm = openModalForm;
		spUtils.removeNotify = removeNotify;
	}
	if ( isJquery ) {
		spUtils.getFormVal = getFormVal;
		spUtils.setFormVal = setFormVal;
	}

	//Expose spUtils as a global object
	window.spUtils = spUtils;
})( window, jQuery );