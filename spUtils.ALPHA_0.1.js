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

(function( window, $, undefined ) {
	// Use the correct document accordingly with window argument (sandbox)
	var document = window.document,
		navigator = window.navigator,
		location = window.location
	; //local vars

	if ( typeof $ === 'undefined' ) {
		//Borrowed from HTML5 Boilerplate
		var g=document.createElement( 'script' ),
			s=document.getElementsByTagName( 'script' )[ 0 ]
		;//local vars

		g.src='//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
		s.parentNode.insertBefore( g, s );
	}

	//Sanbox SharePoint variables
	var executeScript = ExecuteOrDelayUntilScriptLoaded,
		SP,
		//Booleans for environment checking
		isJquery = ( $ || window.jQuery ) ? true : false,
		isSPServices = ( $ && $.fn.SPServices ) ? true : false,
		isSP = ( typeof executeScript !== 'undefined' ) ?
			(function() {
				if ( typeof SP === 'undefined' ) {
					//console.log( "execute SP" );
					executeScript( function() {
						//Set SP to global SP namespace.
						SP = window.SP;
					}, 'sp.js');
				}
				//Set isSP to true.
				return true;
			})() :
			//Set isSP to false.
			false,
		isRoboCAML = ( window.roboCAML ) ? true : false,

		//Create methods
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
		getDDLVal = function( columnName ) {
			var ddlVal = $("select[title='" + columnName + "']").val();

			if ( ddlVal === undefined ) {
				ddlVal = $("input[title='" + columnName + "']").val();
			}

			return ddlVal;
		},
		getListItems = function( opt ) {
			/* Valid options
			* webURL, listName, CAMLQuery, Folder, Include
			*/
			//Add opt to a property of this function. This is useful when the delegate is called.
			this.options = opt || {};

			var targetList,
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
				
				//console.log( SP.CamlQuery.get_viewXml() );
				//debugger;

				this.listItems = targetList.getItems( camlQuery );

				
				//Fields retrieved using Include technique
				if ( opt.hasOwnProperty("Include") ) {
					loopLength = opt.Include.length;
					
					while ( loopLength-- ) {
						//console.log( opt.Include[ loopLength ] );
						includeFields += opt.Include[ loopLength ];
					}
					
					includeFields += ")"; //Close Include
					context.load( listItems, includeFields );
				} else {
					context.load( listItems );
				}

				//Hey idiot... Give ppl a callback /facepalm
				context.executeQueryAsync( getListItemsSucceeded, getListItemsFailed );
			}
			catch ( e ) {
				alert( e );
			}
		},
		getListItemsSucceeded = function( sender, args ) {
			var output = '',
				location = window.location,
				fileType,
				fileRef,
				arrTempVal,
				picName,
				enumerator = listItems.getEnumerator(),
				listData = listItems.get_data(),
				$appendTo = $("#ourMemories");


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
		getListItemsFailed = function(sender, args) {
			var msg = 'Request failed. ' + args.get_message() + '\n';
			
			if ( args.get_stackTrace() ) {
				msg += args.get_stackTrace();
			}
			
			alert( msg );
		},
		onDialogClose = function( dialogResult, returnValue ) {
			//alert("dialog result: " + dialogResult );
			if ( dialogResult === SP.UI.DialogResult.OK ) {
				SP.UI.ModalDialog.commonModalDialogClose( SP.UI.DialogResult.OK );
				SP.UI.Notify.addNotification("This item has been saved...", false);
			}
			if ( dialogResult === SP.UI.DialogResult.cancel ) {
				SP.UI.ModalDialog.commonModalDialogClose( SP.UI.DialogResult.Cancel );
				SP.UI.Notify.addNotification("Operation was cancelled...", false);
			}
		},
		openModalForm = function( staticListName, ID, title, formType, options ) {
			options = options || {};
			//url will find current site for each scenario
			var url;
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
				switch ( formType.toUpperCase() ) {
					case "DISPLAY":
						formType = "DispForm";
						break;
					case "EDIT":
						formType = "EditForm";
						break;
					case "NEW":
						formType = "NewForm";
						break;
					default:
						formType = "DispForm";
						break;
				}

				//Default the base URL to the url variable
				if ( L_Menu_BaseUrl === "" ) {
					url = "/Lists/" + staticListName + "/" + formType + ".aspx?ID=" + ID;
				} else {
					url = L_Menu_BaseUrl + "/Lists/" + staticListName + "/" + formType + ".aspx?ID=" + ID;
				}
			}

			//Valid options listed here: //http://blogs.msdn.com/b/sharepointdev/archive/2011/01/13/using-the-dialog-platform.aspx
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

			//Create modal
			SP.UI.ModalDialog.showModalDialog( opt );
		},
		//Global Object
		spUtils
	; //variable declarations

	//Expose methods based on environment booleans
	if ( isJquery && !isSP ) {
		spUtils = (function() {
			return {
				createCallback : createCallback,
				createDelegate : createDelegate,
				getDDLVal : getDDLVal
			};
		})();
	} else if ( isJquery && isSP ) {
		spUtils = (function() {
			return {
				createCallback : createCallback,
				createDelegate : createDelegate,
				getDDLVal : getDDLVal,
				getListItems : getListItems,
				onDialogClose : onDialogClose,
				openModalForm : openModalForm
			};
		})();
	}

	//Expose spUtils as a global object
	window.spUtils = spUtils;
})( window, jQuery );