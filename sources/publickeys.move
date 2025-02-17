module shareobject::publickeys{
    use sui::ed25519;

    const ESignatureNotVerified: u64 = 1;

    
    const EInvalidOwner: u64 = 1;

    public struct PublicKeys has key, store {
        id: UID,
        public_key_list: vector<vector<u8>>,
    }

    public fun create_signature_list(
        public_key_list: vector<vector<u8>>,
        ctx: &mut TxContext
    ) {
        let uid = object::new(ctx);
        let signature_wrapper = PublicKeys {
            id: uid,
            public_key_list,
        };

        transfer::share_object(signature_wrapper);
    }

    public fun add_publickey(
        signature_wrapper: &mut PublicKeys,
        new_publickey: vector<vector<u8>>
    ) {
        let mut i = 0;
        while (i < vector::length(&new_publickey)) {
            let publickey = *vector::borrow(&new_publickey, i);
            vector::push_back(&mut signature_wrapper.public_key_list, publickey);
            i = i + 1;
        }
    }


    public fun remove_publickey(
        signature_wrapper: &mut PublicKeys,
        index: u64
    ) {
        let len = vector::length(&signature_wrapper.public_key_list);
        assert!(index < len, EInvalidOwner);

        vector::swap_remove(&mut signature_wrapper.public_key_list, index);
    }

public fun test_function(
    signature_wrapper: &PublicKeys,  
    signature: vector<u8>,           
    msg: vector<u8>,                 
    _ctx: &mut TxContext
) {
    let mut verified = false;
    
    let len = vector::length(&signature_wrapper.public_key_list);
    let mut i = 0;
    
    while (i < len) {
        let public_key = vector::borrow(&signature_wrapper.public_key_list, i);

        let is_verified = ed25519::ed25519_verify(&signature, public_key, &msg);
        
        if (is_verified) {
            verified = true;
            break
        };
        i = i + 1;
    };

    assert!(verified, ESignatureNotVerified);
    }
}
