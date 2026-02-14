from fastapi import Depends

from app.utils.jwt_auth import get_current_user

CurrentUser = Depends(get_current_user)
