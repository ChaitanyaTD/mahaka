import Types "./Types";
import Validation "./Validation";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import NFTactor "../DIP721-NFT/Nft";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Error "mo:base/Error";
import List "mo:base/List";
// import StableTrieMap "mo:stable-trie/Map";
import Cycles "mo:base/ExperimentalCycles";
import Nat64 "mo:base/Nat64";
import Region "mo:base/Region";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
// import Uuid "mo:uuid/UUID";
import Utils "./Utils";
import nftTypes "../DIP721-NFT/Types";
import ICRCactor "../ICRC/ICRC"
actor mahaka {


     var _venueMap = TrieMap.TrieMap<Text, Types.Index>(Text.equal,Text.hash);
     private stable var _stableVenueArray :[(Text,Types.Index)] = [];

     stable var Venue_state = {
        bytes = Region.new();
        var bytes_count : Nat64 = 0;
        elems = Region.new ();
        var elems_count : Nat64 = 0;
    };

     var _EventsMap = TrieMap.TrieMap<Text, Types.Index>(Text.equal,Text.hash);
     private stable var _stableEventsArray : [(Text,Types.Index)] = [];

     stable var Events_state = {
        bytes = Region.new();
        var bytes_count : Nat64 = 0;
        elems = Region.new ();
        var elems_count : Nat64 = 0;
     };

     var _WahanaMap = TrieMap.TrieMap<Text, Types.Index>(Text.equal, Text.hash);
     private stable var _stableWahanaArray : [(Text, Types.Index)] = [];

     stable var Wahana_state = {
          bytes = Region.new();
          var bytes_count : Nat64 = 0;
          elems = Region.new ();
          var elems_count : Nat64 = 0;
     };

     // private stable var _eventList : List.List<(Types.venueId, List.List<Types.completeEvent>)> = List.nil<(Types.venueId, List.List<Types.completeEvent>)>();

     private var Users = TrieMap.TrieMap<Principal, Types.Index>(Principal.equal, Principal.hash);
     private var _stableusers : [(Principal, Types.Index)] = [];

     stable var Users_state = {
          bytes = Region.new();
          var bytes_count : Nat64 = 0;
          elems = Region.new ();
          var elems_count : Nat64 = 0;
     };

     system func preupgrade(){
          _stableVenueArray := Iter.toArray(_venueMap.entries());
          _stableEventsArray := Iter.toArray(_EventsMap.entries());
          _stableWahanaArray := Iter.toArray(_WahanaMap.entries());
          _stableusers := Iter.toArray(Users.entries());
     };

     system func postupgrade(){
          _venueMap := TrieMap.fromEntries(_stableVenueArray.vals(), Text.equal, Text.hash);
          _EventsMap := TrieMap.fromEntries(_stableEventsArray.vals(), Text.equal, Text.hash);
          _WahanaMap := TrieMap.fromEntries(_stableWahanaArray.vals(), Text.equal, Text.hash);
          Users := TrieMap.fromEntries(_stableusers.vals(), Principal.equal, Principal.hash);

     };


    // ---------------------------------------------------------------------------------------------------------------------------------
     func regionEnsureSizeBytes(r : Region, new_byte_count : Nat64) {
        let pages = Region.size(r);
        if (new_byte_count > pages << 16) {
        let new_pages = ((new_byte_count + ((1 << 16) - 1)) / (1 << 16)) - pages;
        assert Region.grow(r, new_pages) == pages
        };
     };

    let elem_size = 16 : Nat64;

    func stable_get(index : Types.Index , state : Types.state) : async Blob {
        assert index < state.elems_count;
        let pos = Region.loadNat64(state.elems, index * elem_size);
        let size = Region.loadNat64(state.elems, index * elem_size + 8);
        let elem = { pos ; size };
        Region.loadBlob(state.bytes, elem.pos, Nat64.toNat(elem.size))
    };

    func stable_add(blob : Blob , state :Types.state) : async Types.Index {
        let elem_i = state.elems_count;
        state.elems_count += 1;

        let elem_pos = state.bytes_count;
        state.bytes_count += Nat64.fromNat(blob.size());

        regionEnsureSizeBytes(state.bytes, state.bytes_count);
        Region.storeBlob(state.bytes, elem_pos, blob  );

        regionEnsureSizeBytes(state.elems, state.elems_count * elem_size);
        Region.storeNat64(state.elems, elem_i * elem_size + 0, elem_pos);
        Region.storeNat64(state.elems, elem_i * elem_size + 8, Nat64.fromNat(blob.size  ()));
        elem_i
  }; 

     func update_stable(index: Types.Index, blob: Blob, state: Types.state): async Types.Index {
          assert index < state.elems_count;

          let prev_pos = Region.loadNat64(state.elems, index * elem_size);
          let prev_size = Region.loadNat64(state.elems, index * elem_size + 8);
          let new_size = Nat64.fromNat(blob.size());

          if (new_size > prev_size) {
               let new_pos = state.bytes_count;
               state.bytes_count += new_size;

               regionEnsureSizeBytes(state.bytes, state.bytes_count);
               Region.storeBlob(state.bytes, new_pos, blob);
               Region.storeNat64(state.elems, index * elem_size, new_pos);
          } else {
          
               Region.storeBlob(state.bytes, prev_pos, blob);
          };

          Region.storeNat64(state.elems, index * elem_size + 8, new_size);
          index
     };


//     --------------------------------------------------------------------------------------------------------------------

     
     public shared ({caller = user}) func createVenue(collection_details : Types.venueCollectionParams, _title : Text,_capacity : Nat, _details : Types.venueDetails , _description : Text) : async Result.Result<(id : Text,  venue :Types.Venue),Types.UpdateUserError> {
          // if (Principal.isAnonymous(user)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          // let roleResult = await getRoleByPrincipal(user);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          Cycles.add<system>(500_500_000_000);
          let venueCollection = await NFTactor.Dip721NFT(Principal.fromActor(mahaka), collection_details.collection_args);
          ignore await venueCollection.wallet_receive();
          let new_custodian = await venueCollection.addcustodians(user);
          Debug.print(" New added custodian is : " # debug_show (new_custodian));
          let nftcustodians = await venueCollection.showcustodians();
          Debug.print("These are the list of current custodians : " #debug_show (nftcustodians));
          let venueCollectionId = await venueCollection.getCanisterId();
          let venue_id =  _title # "#" # Principal.toText(venueCollectionId) ;
          let Venue : Types.Venue = {
               logo = collection_details.collection_args.logo;
               banner = collection_details.collection_args.banner;
               Collection_id : Principal = venueCollectionId;
               Description : Text = _description;
               Details : Types.venueDetails = _details;
               Events : List.List<Types.Events> = List.nil<Types.Events>();
               Wahanas : List.List<Types.Wahana_details> = List.nil<Types.Wahana_details>();
               Title : Text = _title;
               capacity : Nat = _capacity;
               id : Text = venue_id;
          };
          let venue_blob = to_candid(Venue);
          let Venue_index : Types.Index = await stable_add(venue_blob, Venue_state);
          _venueMap.put(venue_id, Venue_index);
          return #ok(venue_id,Venue);
     };

     public shared ({caller}) func getVenue(Venue_id : Text) : async (Principal, Types.Venue) {
          let venue_blob: ?Types.Index = _venueMap.get(Venue_id);
          switch (venue_blob) {
               case null {
                    throw Error.reject("Venue not found");
               };
               case (?v){
                    let venue_blob = await stable_get(v, Venue_state);
                    let venue : ?Types.Venue = from_candid(venue_blob);
                    switch (venue) {
                         case null {
                              throw Error.reject("Venue not found");
                         };
                         case (?v) {
                              return (caller, v);
                         };
                    };
               };
          };
     };

     public shared ({caller}) func updateVenue( Venue_id : Text, events : [Types.Events], wahanas : [Types.Wahana_details] ,  Title : Text,
        Description : Text,
        Details : Types.venueDetails,
        capacity : Nat,
        logo : Types.LogoResult,
        banner : Types.LogoResult
        ) : async Result.Result<(Principal, Types.Venue), Types.UpdateUserError> {
          // if (Principal.isAnonymous(caller)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          // let roleResult = await getRoleByPrincipal(caller);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          switch(_venueMap.get(Venue_id)){
               case null {
                    throw Error.reject("Venue not found");
               };
               case (?v){
                    let collection_id = await Utils.extractCanisterId(Venue_id);
                    let Venue : Types.Venue = {
                         id = Venue_id;
                         Title = Title;
                         logo = logo;
                         banner = banner;
                         Description : Text;
                         Details = Details;
                         Events = List.fromArray(events);
                         Wahanas = List.fromArray(wahanas);
                         capacity = capacity;
                         Collection_id = Principal.fromText(collection_id);
                    };
                    let venue_blob = to_candid(Venue);
                    let Venue_index = await update_stable(v, venue_blob, Venue_state);
                    _venueMap.put(Venue_id, Venue_index);
                    return #ok(caller, Venue);
               };
          };
     };

     func updateVenuewithEvents( Venue_id : Text, events : [Types.completeEvent]) : async Types.Venue {
          switch(_venueMap.get(Venue_id)){
               case null {
                    throw Error.reject("Venue not found");
               };
               case(?v){
                    let (_, venue) = await getVenue(Venue_id);
                    let Venue : Types.Venue = {
                         id = venue.id;
                         Title = venue.Title;
                         Description = venue.Description;
                         logo = venue.logo;
                         banner = venue.banner;
                         Details = venue.Details;
                         Events = List.fromArray(events);
                         Wahanas = venue.Wahanas;
                         capacity = venue.capacity;
                         Collection_id = venue.Collection_id;
                    };
                    let venue_blob = to_candid(Venue);
                    let Venue_index = await update_stable(v, venue_blob, Venue_state);
                    _venueMap.put(Venue_id, Venue_index);
                    return Venue;
               }
          }
     };


     func updateVenuewithWahanas( Venue_id : Text, wahanas : [Types.Wahana_details]) : async Types.Venue {
          switch(_venueMap.get(Venue_id)){
               case null {
                    throw Error.reject("Venue not found");
               };
               case(?v){
                    let (_, venue) = await getVenue(Venue_id);
                    let Venue : Types.Venue = {
                         id = venue.id;
                         Title = venue.Title;
                         Description = venue.Description;
                         logo = venue.logo;
                         banner = venue.banner;
                         Details = venue.Details;
                         Wahanas = List.fromArray(wahanas);
                         Events = venue.Events;
                         capacity = venue.capacity;
                         Collection_id = venue.Collection_id;
                    };
                    let venue_blob = to_candid(Venue);
                    let Venue_index = await update_stable(v, venue_blob, Venue_state);
                    _venueMap.put(Venue_id, Venue_index);
                    return Venue;
               }
          }
     };

     public shared ({caller = user}) func deleteVenue(Venue_id : Text) : async Result.Result<(Bool,?Types.Venue), Types.UpdateUserError> {
          // if (Principal.isAnonymous(user)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          // let roleResult = await getRoleByPrincipal(user);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          switch(_venueMap.get(Venue_id)){
               case null {
                    throw Error.reject("Venue not found");
               };
               case (?v){
                    
                    let venue_blob = await stable_get(v, Venue_state);
                    let venue : ?Types.Venue = from_candid(venue_blob);
                    _venueMap.delete(Venue_id);
                    return #ok(true,venue);
               };
          };
     };

     public shared func getAllVenues(chunkSize : Nat , pageNo : Nat) : async {data : [Types.Venue] ; current_page : Nat ; Total_pages : Nat} {
          var venues = List.nil<Types.Venue>();
          for ((venue_id, venue_index) in _venueMap.entries()) {
               let venue_blob = await stable_get(venue_index, Venue_state);
               let venue : ?Types.Venue = from_candid(venue_blob);
               switch (venue) {
                    case null {
                         throw Error.reject("Venue not found");
                    };
                    case (?v) {
                         venues := List.push(v,venues);
                    };
               };
          };
          let index_pages = Utils.paginate<Types.Venue>(List.toArray(venues), chunkSize);
          if (index_pages.size() < pageNo) {
            throw Error.reject("Page not found");
          };
          if (index_pages.size() == 0) {
            throw Error.reject("No products found");
          };
          let pages_data = index_pages[pageNo];
          return {data = pages_data; current_page = pageNo + 1 ; Total_pages = index_pages.size()};
     };


     // Search venues 
     public shared func searchVenues(searchTerm: Text, chunkSize: Nat, pageNo: Nat) : async {data: [Types.Venue]; current_page: Nat; total_pages: Nat} {
          var matchingVenues = List.nil<Types.Venue>();
          let loweredSearchTerm = Text.toLowercase(searchTerm);

          for ((venue_id, venue_index) in _venueMap.entries()) {
               let venue_blob = await stable_get(venue_index, Venue_state);
               let venue: ?Types.Venue = from_candid(venue_blob);
               
               switch (venue) {
                    case null {
                         throw Error.reject("Venue not found");
                    };
                    case (?v) {
                         if (Text.contains(Text.toLowercase(v.Title), #text loweredSearchTerm) or Text.contains(Text.toLowercase(v.Description), #text loweredSearchTerm)) {
                              matchingVenues := List.push(v, matchingVenues);
                         };
                    };
               };
          };

          let matchingVenuesArray = List.toArray(matchingVenues);
          let indexPages = Utils.paginate<Types.Venue>(matchingVenuesArray, chunkSize);
          
          if (indexPages.size() < pageNo) {
               throw Error.reject("Page not found");
          };
          if (indexPages.size() == 0) {
               throw Error.reject("No venues found matching the search Pattern");
          };
          
          let pageData = indexPages[pageNo];
          return { data = pageData; current_page = pageNo + 1; total_pages = indexPages.size() };
     };



     public shared ({caller = user}) func createEvent(venueId: Types.venueId, Event: Types.Events, eCollection: Types.eventCollectionParams): async Result.Result<Types.completeEvent, Types.UpdateUserError> {
          // if (Principal.isAnonymous(user)) {
          //      return #err(#UserNotAuthenticated); 
          // };
          // let roleResult = await getRoleByPrincipal(user);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          Cycles.add<system>(500_500_000_000);
          let eventCollection = await NFTactor.Dip721NFT(Principal.fromActor(mahaka), eCollection.collection_args);
          let new_custodian = await eventCollection.addcustodians(user);
          Debug.print("New added custodian is: " # debug_show(new_custodian));
          let nftcustodians = await eventCollection.showcustodians();
          Debug.print("These are the list of current custodians: " # debug_show(nftcustodians));
          ignore await eventCollection.wallet_receive();
          let eventCollectionId = await eventCollection.getCanisterId();
          let eventId = Event.title # "#" # Principal.toText(eventCollectionId);

          let newEvent: Types.completeEvent = {
               id = eventId;
               description = Event.description;
               details = Event.details;
               logo = Event.logo;
               banner = Event.banner;
               gTicket_limit = Event.gTicket_limit;
               sTicket_limit = Event.sTicket_limit;
               title = Event.title;
               vTicket_limit = Event.vTicket_limit;
               event_collectionid = await eventCollection.getCanisterId();
          };

          let existingEvents = _EventsMap.get(venueId);

          let updatedEvents: Types.Events_data = switch (existingEvents) {
               case null {
                    let Events : Types.Events_data = {
                         Events = List.push(newEvent, List.nil<Types.completeEvent>());
                    }
               };
               case (?eventIndex) {
                    let eventsBlob = await stable_get(eventIndex, Events_state);
                    let existingData: ?Types.Events_data = from_candid(eventsBlob);
                    switch (existingData) {
                         case null {
                              let Events : Types.Events_data = {
                              Events = List.push(newEvent, List.nil<Types.completeEvent>());
                              }    
                         };
                         case (?data) {
                              let Events : Types.Events_data = {
                              Events = List.push(newEvent, data.Events);
                              }
                         };
                    }
               };
          };

          let updatedVenue = await updateVenuewithEvents(venueId,List.toArray(updatedEvents.Events));

          let eventBlob = to_candid(updatedEvents);
          let eventIndex = await stable_add(eventBlob, Events_state);
          _EventsMap.put(venueId, eventIndex);

          return #ok(newEvent);
     };

     public shared func getallEventsbyVenue(chunkSize : Nat , pageNo : Nat, venueId : Types.venueId) : async {data : [Types.completeEvent] ; current_page : Nat ; Total_pages : Nat} {
          let events_object = _EventsMap.get(venueId);
          switch (events_object){
               case null {
                    throw (Error.reject("No event found in the venue"));
               };
               case (?v){
                    let events_object_blob = await stable_get(v,Events_state);
                    let events_object : ?Types.Events_data = from_candid(events_object_blob);
                    switch (events_object){
                         case null {
                              throw (Error.reject("No object found in the memory"));
                         };
                         case (?v){
                              let events_list = v;
                              let index_pages = Utils.paginate<Types.completeEvent>(List.toArray(events_list.Events), chunkSize);
                              if (index_pages.size() < pageNo) {
                                   throw Error.reject("Page not found");
                              };
                              if (index_pages.size() == 0) {
                                   throw Error.reject("No products found");
                              };
                              let pages_data = index_pages[pageNo];
                              return {data = pages_data; current_page = pageNo + 1; Total_pages = index_pages.size()};
                         };
                    };
               };
          }; 
     };

     public shared ({caller = user}) func edit_event(eventId : Text, venueId : Types.venueId ,  _eCollection : Types.eventCollectionParams , _event : Types.Events) : async Result.Result<(Types.completeEvent, Text), Types.UpdateUserError> {
          // if (Principal.isAnonymous(user)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          // let roleResult = await getRoleByPrincipal(user);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          let events_object = _EventsMap.get(venueId);
          switch (events_object){
               case null {
                    throw (Error.reject("No Events Found in the Venue"));
               };
               case (?v){
                    let events_object_blob = await stable_get(v,Events_state);
                    let events_object : ?Types.Events_data = from_candid(events_object_blob);
                    switch (events_object) {
                         case null {
                              throw (Error.reject("No object found in the memory"));
                         };
                         case (?val){
                              var events_list = val.Events;
                              let event = List.find<Types.completeEvent>(
                                   events_list,
                                   func x {x.id == eventId}
                              );
                              switch(event){
                                   case null {
                                        throw (Error.reject("Event not found in the list"));
                                   };
                                   case (?event){
                                        let result = await Utils.is_event_editable(event);
                                        assert( result == true);
                                        Cycles.add<system>(500_500_000_000);
                                        let eventCollection = await NFTactor.Dip721NFT(Principal.fromActor(mahaka), _eCollection.collection_args);
                                        let new_custodian = await eventCollection.addcustodians(user);
                                        Debug.print(" New added custodian is : " # debug_show (new_custodian));
                                        let nftcustodians = await eventCollection.showcustodians();
                                        Debug.print("These are the list of current custodians : " #debug_show (nftcustodians));
                                        ignore await eventCollection.wallet_receive();
                                        let eventCollectionId = await eventCollection.getCanisterId();
                                        let eventId =  _event.title # "#" # Principal.toText(eventCollectionId);
                                        let updated_event : Types.completeEvent = {
                                             id = eventId;
                                             description = _event.description;
                                             details =_event.details;
                                             logo = _event.logo;
                                             banner =_event.banner ;
                                             gTicket_limit = _event.gTicket_limit;
                                             sTicket_limit = _event.sTicket_limit;
                                             title = _event.title;
                                             vTicket_limit = _event.vTicket_limit;
                                             event_collectionid = await eventCollection.getCanisterId();
                                        };
                                        let updated_events_list = List.map<Types.completeEvent, Types.completeEvent>(
                                             events_list,
                                             func(existing_event) {
                                                  if (existing_event.id == eventId) {
                                                       updated_event
                                                  } else {
                                                       existing_event
                                                  }
                                             }
                                        );
                                        let updated_events_data: Types.Events_data = {
                                             Events = updated_events_list;
                                        };

                                        let updatedVenue = await updateVenuewithEvents(venueId,List.toArray(updated_events_data.Events));
                                        let eventBlob = to_candid(updated_events_data);
                                        let eventIndex = await update_stable(v,eventBlob, Events_state);
                                        _EventsMap.put(venueId, eventIndex);

                                        return #ok(updated_event,"Event Edited");

                                   };
                              };
                         };
                    };
               };
          };
     };

     public shared ({caller = user}) func deleteEvent (venue_id : Types.venueId, eventId : Text) : async Result.Result<(Bool, Types.Index), Types.UpdateUserError> {
          // if (Principal.isAnonymous(user)) {
          //      return #err(#UserNotAuthenticated); 
          // };
          // let roleResult = await getRoleByPrincipal(user);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
           switch(_EventsMap.get(venue_id)){
               case null {
                    throw(Error.reject("No venue found for the events"));
               };
               case (?Event_index){
                    let event_blob = await stable_get(Event_index,Events_state);
                    let event_object :?Types.Events_data = from_candid(event_blob);
                    switch(event_object){
                         case null {
                              throw(Error.reject("No object found for this blob in the memory"));
                         };
                         case (?e){
                              let updated_events_list = List.filter<Types.completeEvent>(
                                   e.Events,
                                   func x { x.id != eventId }
                              );
                              let updated_event_data = {
                                   e with Events = updated_events_list
                              };
                              let event_blob = to_candid(updated_event_data);
                              let event_index = await update_stable(Event_index, event_blob, Events_state);
                              _EventsMap.put(venue_id, Event_index);
                              return #ok(true, event_index);
                         };
                    };
               };
          };
     };


    // Search events
     public shared func searchEvents(searchTerm: Text, chunkSize: Nat, pageNo: Nat) : async {data: [Types.completeEvent]; current_page: Nat; total_pages: Nat} {
          var matchingEvents = List.nil<Types.completeEvent>();
          let loweredSearchTerm = Text.toLowercase(searchTerm);

          for ((venue_id, event_index) in _EventsMap.entries()) {
               let event_blob = await stable_get(event_index, Events_state);
               let eventsList: ?Types.Events_data = from_candid(event_blob);
               
               switch (eventsList) {
                    case null {
                         throw Error.reject("No Events found");
                    };
                    case (?list) {
                         let filteredEvents : List.List<Types.completeEvent> = List.filter<Types.completeEvent>(list.Events, func (e : Types.completeEvent) : Bool {
                              Text.contains(Text.toLowercase(e.title), #text loweredSearchTerm) or Text.contains(Text.toLowercase(e.description),#text loweredSearchTerm) 
                         });
                         for (event in List.toArray(filteredEvents).vals()) {
                              matchingEvents := List.push(event, matchingEvents);
                         };
                    };
               };
          };

          // Convert the list of matching events to an array for pagination
          let matchingEventsArray = List.toArray(matchingEvents);
          Debug.print(debug_show(matchingEventsArray));
          let indexPages = Utils.paginate<Types.completeEvent>(matchingEventsArray, chunkSize);
          
          // Handle pagination
          if (indexPages.size() < pageNo) {
               throw Error.reject("Page not found");
          };
          if (indexPages.size() == 0) {
               throw Error.reject("No Events found matching the search pattern");
          };
          
          let pageData = indexPages[pageNo];
          return { data = pageData; current_page = pageNo + 1; total_pages = indexPages.size() };
     };





     /*********************************************************/
     /*                   Tickets Handlig                     */
     /*********************************************************/

    
     public shared ({caller}) func buyVenueTicket(venueId : Types.venueId, _ticket_type : Types.ticket_info, _metadata : nftTypes.MetadataDesc ) : async Result.Result<nftTypes.MintReceipt, Types.UpdateUserError> {
          // if (Principal.isAnonymous(caller)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          // let roleResult = await getRoleByPrincipal(caller);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          let collection_id = await Utils.extractCanisterId(venueId);
          let collection_actor = actor (collection_id) : actor {
               logoDip721 : () -> async Types.LogoResult;
               mintDip721 : (to : Principal, metadata : Types.MetadataDesc ,ticket_details : nftTypes.ticket_type, logo : Types.LogoResult) -> async nftTypes.MintReceipt;
          };
          let _logo = await collection_actor.logoDip721();
          let _ticket = await collection_actor.mintDip721(caller,_metadata,_ticket_type.ticket_type,_logo);
     
          return #ok(_ticket);
     };

     public shared ({caller}) func buyEventTicket(_venueId : Text,_eventId : Text, _ticket_type : Types.ticket_info, _metadata : nftTypes.MetadataDesc) : async Result.Result<nftTypes.MintReceipt, Types.UpdateUserError> {
          // if (Principal.isAnonymous(caller)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          // let roleResult = await getRoleByPrincipal(caller);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          switch(_EventsMap.get(_venueId)){
               case null {
                    throw(Error.reject("No venue found for the events"));
               };
               case (?Event_index){
                    let event_blob = await stable_get(Event_index,Events_state);
                    let event_object :?Types.Events_data = from_candid(event_blob);
                    switch(event_object){
                         case null {
                              throw(Error.reject("No object found for this blob in the memory"));
                         };

                         case (?e){
                              let events_list = e.Events;
                              let event = List.find<Types.completeEvent>(
                                   events_list,
                                   func x {x.id == _eventId}
                              );
                              switch (event){
                                   case null (
                                        throw (Error.reject("No Event found")) 
                                   );
                                   case (?_event){
                                        let collection_actor = actor (Principal.toText(_event.event_collectionid)) : actor {
                                        logoDip721 : () -> async Types.LogoResult;
                                        mintDip721 : (to : Principal, metadata : Types.MetadataDesc ,ticket_details : nftTypes.ticket_type, logo : Types.LogoResult) -> async nftTypes.MintReceipt;                                        
                                        };
                                        let _logo = await collection_actor.logoDip721();
                                        let _ticket = await collection_actor.mintDip721(caller,_metadata,_ticket_type.ticket_type,_logo);
                                        return #ok(_ticket);
                                   };
                              };                           
                         };
                    };
               };
          };
     };

     /*********************************************************/
     /*                   User CRUD                           */
     /*********************************************************/

    public shared ({ caller }) func updateUser(principalId : Principal, email : Text, firstName : Text, lastName : Text, role : Types.Roles, assignedVenue : Text) : async Result.Result<(Types.User, Types.Index), Types.UpdateUserError> {
          // if (Principal.isAnonymous(caller)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          // let roleResult = await getRoleByPrincipal(caller);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          if (email == "") { return #err(#EmptyEmail) };
          if (firstName == "") { return #err(#EmptyFirstName) };
          if (lastName == "") { return #err(#EmptyLastName) };
          //    if (role == "") { return #err(#EmptyRole) };
          if (assignedVenue == "") { return #err(#EmptyLastName) };

          let user : Types.User = {
               id = principalId;
               email = email;
               firstName = firstName;
               lastName = lastName;
               role = role;
               assignedVenue = assignedVenue;
          };
          switch(Users.get(principalId)){

               case null {
                    let user_blob = to_candid(user);
                    let user_index = await stable_add(user_blob, Users_state);
                    Users.put(principalId, user_index);
                    return #ok(user, user_index);
               };
               case (?v){
                    let user_blob = to_candid(user);
                    let user_index = await update_stable(v, user_blob, Users_state);
                    return #ok(user, user_index);
               };
          };
     };

     public shared ({ caller }) func addAdmins(principalId : Principal, email : Text, firstName : Text, lastName : Text, role : Types.Roles, assignedVenue : Text) : async Result.Result<(Types.User, Types.Index), Types.UpdateUserError> {
          // if (Principal.isAnonymous(caller)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          if (not Principal.isController(caller)) {
               return #err(#UserNotAuthorized);
          };
          if (email == "") { return #err(#EmptyEmail) };
          if (firstName == "") { return #err(#EmptyFirstName) };
          if (lastName == "") { return #err(#EmptyLastName) };
          //    if (role == "") { return #err(#EmptyRole) };
          if (assignedVenue == "") { return #err(#EmptyLastName) };

          let user : Types.User = {
               id = principalId;
               email = email;
               firstName = firstName;
               lastName = lastName;
               role = role;
               assignedVenue = assignedVenue;
          };
          switch(Users.get(principalId)){

               case null {
                    let user_blob = to_candid(user);
                    let user_index = await stable_add(user_blob, Users_state);
                    Users.put(principalId, user_index);
                    return #ok(user, user_index);
               };
               case (?v){
                    let user_blob = to_candid(user);
                    let user_index = await update_stable(v, user_blob, Users_state);
                    return #ok(user, user_index);
               };
          };
     };

    public shared ({ caller }) func getUserdetailsbycaller() : async Result.Result<Types.User, Types.GetUserError> {
        let index = Users.get(caller);
        switch(index){
            case null {
                return #err(#UserNotFound);
            };

            case (?val){
                let user_blob = await stable_get(val, Users_state);
                Debug.print("The blob for the " # debug_show(caller) # " is: " # debug_show(user_blob));
                let user : ?Types.User = from_candid(user_blob);
                Debug.print("The user data for the " # debug_show(caller) # " is: " # debug_show(user));
                switch(user){
                    case null {
                        throw Error.reject("no blob found in stable memory for the caller");
                    };
                    case(?v){
                        return #ok(v);
                    };
                };
            };
        };
    };

    public shared func getUserdetailsbyid(id : Principal) : async Result.Result<Types.User, Types.GetUserError> {
          let user = Users.get(id);
          switch(user){
               case null {
                    return #err(#UserNotFound);
               };

               case (?val){
                    let user_blob = await stable_get(val, Users_state);
                    Debug.print("The blob for the " # debug_show(id) # " is: " # debug_show(user_blob));
                    let user : ?Types.User = from_candid(user_blob);
                    Debug.print("The user data for the " # debug_show(id) # " is: " # debug_show(user));
                    switch(user){
                         case null {
                              throw Error.reject("no blob found in stable memory for the caller");
                         };
                         case(?v){
                         return #ok(v);
                         };
                    };
               };
          };        
     };

    // 📍📍📍📍📍
    public shared func listUsers(chunkSize : Nat , PageNo : Nat) : async{data : [Types.User]; current_page : Nat; total_pages : Nat} {
        let index_pages =  Utils.paginate<(Principal , Types.Index)>(Iter.toArray(Users.entries()), chunkSize);
        if (index_pages.size() < PageNo) {
            throw Error.reject("Page not found");
        };
        if (index_pages.size() == 0) {
            throw Error.reject("No users found");
        };

        // let data_page:[Types.User] = Array.tabulate<>(index_pages[pageNo],func x(1) = from_candid(x(1)));
        var pages_data = index_pages[PageNo];
        var user_list = List.nil<Types.User>();
        for ((k,v) in pages_data.vals()) {
            
            let user_blob = await stable_get(v, Users_state);
            let user : ?Types.User = from_candid(user_blob);
            switch(user){
                case null {
                    throw Error.reject("no blob found in stable memory for the caller");
                };
                case(?val){
                    user_list := List.push(val, user_list);
                };
            };
        };
        return { data = List.toArray(user_list); current_page = PageNo + 1; total_pages = index_pages.size(); };
    };


    public shared ({caller}) func deleteUserByPrincipal(user : Principal) : async Result.Result<?Types.User, Types.UpdateUserError> {
          // if (Principal.isAnonymous(user)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          // let roleResult = await getRoleByPrincipal(caller);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          switch(Users.remove(user)){
               case null {
                    throw(Error.reject("No User found"));
               };
               case (?u){
                    let user = await stable_get(u, Users_state);
                    return #ok(from_candid(user));
               };
          };
    };

    public shared ({caller = user}) func getRoleByCaller() : async Result.Result<Types.Roles, Types.GetUserError> {
          let userObj = await getUserdetailsbyid(user);
          switch(userObj){
               case(#err(error)) {
                    return #err(error);
               };
               case(#ok(u)){
                    return #ok(u.role);
               };
          };
    };

    public shared func getRoleByPrincipal(user : Principal) : async Result.Result<Types.Roles, Types.GetUserError> {
          let userObj = await getUserdetailsbyid(user);
          switch(userObj){
               case(#err(error)) {
                    return #err(error);
               };
               case(#ok(u)){
                    return #ok(u.role);
               };
          };
    };
     /*********************************************************/
     /*                   Wahana Handling                     */
     /*********************************************************/

     public shared ({caller = user}) func createWahana(venueId : Text,_name : Text , _symbol : Text, _decimals : Nat8 , _totalSupply :Nat , description : Text , banner : Types.LogoResult, priceinusd : Text) : async Result.Result<Types.Wahana_details, Types.UpdateUserError> {
          // if (Principal.isAnonymous(user)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          // let roleResult = await getRoleByPrincipal(user);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          Cycles.add<system>(500_000_000_000);
          let initial_mints = [{
               account = { owner = Principal.fromActor(mahaka); subaccount = null };
               amount = _totalSupply;
          }];

          let init = {
               decimals : Nat8 = _decimals;
               initial_mints : [{
               account : {
                    owner : Principal;
                    subaccount : ?Blob;
               };
               amount : Nat;
               }] = initial_mints;
               minting_account : {
                    owner : Principal;
                    subaccount : ?Blob;
               } = { owner = user; subaccount = null };
               token_name : Text = _name;
               token_symbol : Text = _symbol;
               transfer_fee : Nat = 0;
          };
          let Wahanatokens = await ICRCactor.Ledger(init);
          let wahana_id = Principal.fromActor(Wahanatokens);
          ignore await Wahanatokens.wallet_receive();
          
          let new_wahana : Types.Wahana_details = {
               id = Principal.toText(wahana_id);
               banner = banner;
               description = description;
               priceinusd = priceinusd;
               ride_title = _name;
               creator = user;
          };

          let existingWahanas = _WahanaMap.get(venueId);

          let updatedWahanas: Types.Wahana_data = switch (existingWahanas) {
               case null {
                    let Wahanas : Types.Wahana_data = {
                         Wahanas = List.push(new_wahana, List.nil<Types.Wahana_details>());
                    }
               };
               case (?wahanaIndex) {
                    let wahanasBlob = await stable_get(wahanaIndex, Wahana_state);
                    let existingData: ?Types.Wahana_data = from_candid(wahanasBlob);
                    switch (existingData) {
                         case null {
                              let Wahanas : Types.Wahana_data = {
                              Wahanas = List.push(new_wahana, List.nil<Types.Wahana_details>());
                              }    
                         };
                         case (?data) {
                              let Wahanas : Types.Wahana_data = {
                              Wahanas = List.push(new_wahana, data.Wahanas);
                              }
                         };
                    }
               };
          };
          let updatedVenue = await updateVenuewithWahanas(venueId,List.toArray(updatedWahanas.Wahanas));
          let wahana_blob = to_candid(updatedWahanas);
          let wahana_index = await stable_add(wahana_blob,Wahana_state);
          _WahanaMap.put(venueId,wahana_index);
          return #ok(new_wahana);
     };

     public shared func getallWahanasbyVenue(chunkSize : Nat , pageNo : Nat, venueId : Types.venueId) : async {data : [Types.Wahana_details] ; current_page : Nat ; Total_pages : Nat} {
          let wahanas_object = _WahanaMap.get(venueId);
          switch (wahanas_object){
               case null {
                    throw (Error.reject("No Wahana found in the venue"));
               };
               case (?w){
                    let wahanas_object_blob = await stable_get(w,Wahana_state);
                    let wahanas_object : ?Types.Wahana_data = from_candid(wahanas_object_blob);
                    switch (wahanas_object){
                         case null {
                              throw (Error.reject("No object found in the memory"));
                         };
                         case (?list){
                              let wahanas_list = list;
                              let index_pages = Utils.paginate<Types.Wahana_details>(List.toArray(wahanas_list.Wahanas), chunkSize);
                              if (index_pages.size() < pageNo) {
                                   throw Error.reject("Page not found");
                              };
                              if (index_pages.size() == 0) {
                                   throw Error.reject("No data found");
                              };
                              let pages_data = index_pages[pageNo];
                              return {data = pages_data; current_page = pageNo + 1; Total_pages = index_pages.size()};
                         };
                    };
               };
          };
     };

     public shared ({caller = user}) func edit_wahana(
          wahanaId: Text,
          venueId: Text,
          _name: Text,
          _symbol: Text,
          _decimals: Nat8,
          _totalSupply: Nat,
          description: Text,
          banner: Types.LogoResult,
          priceinusd: Text
     ) : async Result.Result<Text, Types.UpdateUserError> {
          // if (Principal.isAnonymous(user)) {
          //      return #err(#UserNotAuthenticated); 
          // };
          // let roleResult = await getRoleByPrincipal(user);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          let wahanas_object = _WahanaMap.get(venueId);
          switch (wahanas_object) {
               case null {
                    throw (Error.reject("No Wahanas Found in the Venue"));
               };
               case (?w) {
                    let wahanas_object_blob = await stable_get(w, Wahana_state);
                    let wahanas_object: ?Types.Wahana_data = from_candid(wahanas_object_blob);
                    switch (wahanas_object) {
                         case null {
                              throw (Error.reject("No object found in the memory"));
                         };
                         case (?val) {
                              var wahanas_list = val.Wahanas;
                              let wahana = List.find<Types.Wahana_details>(
                                   wahanas_list,
                                   func x { x.id == wahanaId }
                              );
                              switch (wahana) {
                              case null {
                                   throw (Error.reject("Wahana not found in the list"));
                              };
                              case (?wahana) {

                                   Cycles.add<system>(500_000_000_000);
                                   let initial_mints = [{
                                        account = { owner = Principal.fromActor(mahaka); subaccount = null };
                                        amount = _totalSupply;
                                   }];

                                   let init = {
                                        decimals : Nat8 = _decimals;
                                        initial_mints : [{
                                        account : {
                                             owner : Principal;
                                             subaccount : ?Blob;
                                        };
                                        amount : Nat;
                                        }] = initial_mints;
                                        minting_account : {
                                             owner : Principal;
                                             subaccount : ?Blob;
                                        } = { owner = user; subaccount = null };
                                        token_name : Text = _name;
                                        token_symbol : Text = _symbol;
                                        transfer_fee : Nat = 0;
                                   };

                                   let Wahanatokens = await ICRCactor.Ledger(init);
                                   let wahana_id = Principal.fromActor(Wahanatokens);
                                   ignore await Wahanatokens.wallet_receive();

                                   let updated_wahana: Types.Wahana_details = {
                                        id = Principal.toText(wahana_id); 
                                        banner = banner;
                                        description = description;
                                        priceinusd = priceinusd;
                                        ride_title = _name;
                                        creator = wahana.creator;
                                   };

                                   let updated_wahanas_list = List.map<Types.Wahana_details, Types.Wahana_details>(
                                        wahanas_list,
                                        func(existing_wahana) {
                                             if (existing_wahana.id == wahanaId) {
                                                  updated_wahana
                                             } else {
                                                  existing_wahana
                                             }
                                        }
                                   );
                                   let updated_wahana_data: Types.Wahana_data = {
                                        Wahanas = updated_wahanas_list;
                                   };
                                   let updatedVenue = await updateVenuewithWahanas(venueId,List.toArray(updated_wahana_data.Wahanas));
                                   let wahana_blob = to_candid(updated_wahana_data);
                                   let wahana_index = await update_stable(w,wahana_blob, Wahana_state);
                                   _WahanaMap.put(venueId, wahana_index);
                                   return #ok("Wahana updated successfully!");
                              };
                              };
                         };
                    };
               };
          };
     };


     public shared ({caller = user}) func deleteWahana (venue_id: Types.venueId, wahanaId: Text) : async Result.Result<(Bool, Types.Index), Types.UpdateUserError> {
          // if (Principal.isAnonymous(user)) {
          //      return #err(#UserNotAuthenticated); 
          // }; 
          // let roleResult = await getRoleByPrincipal(user);
          // switch (roleResult) {
          //      case (#err(error)) {
          //           return #err(#RoleError);
          //      };
          //      case (#ok(role)) {
          //           if (not ((await Validation.check_for_sysAdmin(role)) or (await Validation.check_for_Admin(role)))) {
          //                return #err(#UserNotAuthorized);
          //           };
          //      };
          // };
          switch(_WahanaMap.get(venue_id)) {
               case null {
                    throw(Error.reject("No venue found for the events"));
               };
               case (?Wahana_index) {
                    let wahana_blob = await stable_get(Wahana_index, Wahana_state);
                    let wahana_object: ?Types.Wahana_data = from_candid(wahana_blob);

                    switch (wahana_object) {
                         case null {
                              throw(Error.reject("No object found for this blob in the memory"));
                         };
                         case (?w) {
                              let maybe_wahana = List.find<Types.Wahana_details>(w.Wahanas, func (x: Types.Wahana_details) : Bool {
                                   x.id == wahanaId
                              });

                              switch(maybe_wahana) {
                                   case null {
                                        throw(Error.reject("Wahana not found"));
                                   };
                                   case (?wahana) {
                                        if (wahana.creator != user) {
                                             throw(Error.reject("You are not the creator of this wahana"));
                                        };
                                   };
                              };
                              let updated_wahanas_list = List.filter<Types.Wahana_details>(
                                   w.Wahanas,
                                   func (x: Types.Wahana_details) : Bool { x.id != wahanaId }
                              );
                              let updated_event_data = {
                                   w with Wahanas = updated_wahanas_list 
                              };
                              let wahana_blob = to_candid(updated_event_data);
                              let wahana_index = await update_stable(Wahana_index, wahana_blob, Wahana_state);
                              _WahanaMap.put(venue_id, wahana_index);
                              return #ok((true, wahana_index));
                         };
                    };
               };
          };
     };

     // Search wahanas
     public shared func searchWahanas(searchTerm: Text, chunkSize: Nat, pageNo: Nat) : async {data: [Types.Wahana_details]; current_page: Nat; total_pages: Nat} {
          var matchingWahanas = List.nil<Types.Wahana_details>();
          let loweredSearchTerm = Text.toLowercase(searchTerm);

          for ((venue_id, wahana_index) in _WahanaMap.entries()) {
               let wahana_blob = await stable_get(wahana_index, Wahana_state);
               let wahanasList: ?Types.Wahana_data = from_candid(wahana_blob);
               
               switch (wahanasList) {
                    case null {
                         throw Error.reject("No Wahanas found");
                    };
                    case (?list) {
                         let filteredWahanas : List.List<Types.Wahana_details> = List.filter<Types.Wahana_details>(list.Wahanas, func (w : Types.Wahana_details) : Bool {
                              Text.contains(Text.toLowercase(w.ride_title), #text loweredSearchTerm) or Text.contains(Text.toLowercase(w.description),#text loweredSearchTerm) 
                         });
                         for (event in List.toArray(filteredWahanas).vals()) {
                              matchingWahanas := List.push(event, matchingWahanas);
                         };
                    };
               };
          };

          let matchingWahanasArray = List.toArray(matchingWahanas);
          let indexPages = Utils.paginate<Types.Wahana_details>(matchingWahanasArray, chunkSize);
          
          if (indexPages.size() < pageNo) {
               throw Error.reject("Page not found");
          };
          if (indexPages.size() == 0) {
               throw Error.reject("No Wahanas found matching the search pattern");
          };
          
          let pageData = indexPages[pageNo];
          return { data = pageData; current_page = pageNo + 1; total_pages = indexPages.size() };
     };



}