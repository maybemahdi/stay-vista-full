import { useParams } from 'react-router-dom';
import UpdateRoomForm from '../../Form/UpdateRoomForm';

const UpdateRoom = () => {
    const {id} = useParams()
    return (
        <div>
            <UpdateRoomForm id={id}/>
        </div>
    );
};

export default UpdateRoom;